const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const db = require("../db");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

router.use(authenticate);

function ensureCompanyAccess(req, res, next) {
  if (req.user.type === "admin") return next();
  const companyId = req.params.companyId || req.body.companyId;
  if (String(req.user.companyId) !== String(companyId)) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}

// ── AI: Extract customer data from document images ───────────
router.post("/extract-from-documents", async (req, res) => {
  try {
    const { images } = req.body; // array of base64 data URIs
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "No images provided" });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    // Build vision messages – each image as an image_url content part
    const imageContents = images.map((dataUri) => ({
      type: "image_url",
      image_url: { url: dataUri },
    }));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a document data extraction assistant for a car rental company. Analyze the uploaded document images (ID cards, passports, driver's licenses) and extract customer information.

Return ONLY a valid JSON object with these fields (use null for fields you cannot find):
{
  "usable": boolean (false if the image is NOT a recognizable identity document, is too blurry to read, or contains no extractable personal information),
  "firstName": string or null,
  "lastName": string or null,
  "email": string or null,
  "phone": string or null,
  "idNumber": string or null (government ID / passport number),
  "driversLicense": string or null (driver's license number),
  "driversLicenseExpiry": string or null (YYYY-MM-DD format),
  "dateOfBirth": string or null (YYYY-MM-DD format),
  "address": string or null,
  "city": string or null,
  "country": string or null,
  "documentTypes": array of strings – which document types were detected: "id_card", "drivers_license", "passport"
}

Important rules:
- Set "usable" to false if the image is not an ID card, passport, or driver's license, or if it is too blurry/unclear to extract any data from
- Extract ALL visible text fields from the documents
- For dates, always convert to YYYY-MM-DD format
- For names, capitalize properly (e.g. "JOHN DOE" → "John", "Doe")
- If multiple documents are provided, merge data from all of them
- Only return the JSON object, no markdown, no explanation`,
              },
              ...imageContents,
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenRouter API error:", response.status, errBody);
      return res.status(502).json({ error: "AI service request failed" });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response (strip markdown fences if present)
    let extracted;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extracted = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      return res.status(502).json({ error: "Failed to parse AI response" });
    }

    // Check if AI deemed the image unusable
    if (extracted.usable === false) {
      return res.status(422).json({ error: "unusable_document" });
    }

    res.json(extracted);
  } catch (err) {
    console.error("Document extraction error:", err);
    res.status(500).json({ error: "Failed to extract document data" });
  }
});

// ── List customers for authenticated user's company (shortcut)
router.get("/", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });
    const customers = await db.Customer.findAll({
      where: { companyId: req.user.companyId },
      order: [["createdAt", "DESC"]],
    });
    res.json({ rows: customers, count: customers.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// ── Create customer for authenticated user's company (shortcut)
router.post("/", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });

    // Clean optional fields – convert empty strings to null
    const data = { ...req.body };
    const { documents, ...customerData } = data;
    const optionalFields = ["email", "idNumber", "driversLicense", "driversLicenseExpiry", "dateOfBirth", "address", "city", "country", "notes"];
    for (const key of optionalFields) {
      if (customerData[key] === "" || customerData[key] === undefined) customerData[key] = null;
    }

    const customer = await db.Customer.create({
      companyId: req.user.companyId,
      ...customerData,
    });

    // Save documents if provided
    if (documents && Array.isArray(documents) && documents.length > 0) {
      await db.CustomerDocument.bulkCreate(
        documents.map((doc) => ({
          customerId: customer.id,
          url: doc.url,
          documentType: doc.documentType || "other",
        }))
      );
    }

    // Reload with documents
    const full = await db.Customer.findByPk(customer.id, {
      include: [{ model: db.CustomerDocument, as: "documents" }],
    });

    res.status(201).json(full);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Customer with this phone already exists in this company" });
    }
    console.error("Create customer error:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// ── List customers for a company ──────────────────────────────
router.get("/company/:companyId", ensureCompanyAccess, async (req, res) => {
  try {
    const customers = await db.Customer.findAll({
      where: { companyId: req.params.companyId },
      order: [["createdAt", "DESC"]],
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// ── Get single customer ──────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const customer = await db.Customer.findByPk(req.params.id, {
      include: [
        {
          model: db.Booking,
          as: "bookings",
          include: [{ model: db.Car, as: "car", attributes: ["id", "make", "model", "licensePlate"] }],
          order: [["startDate", "DESC"]],
        },
        {
          model: db.CustomerDocument,
          as: "documents",
          attributes: ["id", "url", "documentType", "createdAt"],
          order: [["createdAt", "ASC"]],
        },
      ],
    });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// ── Create customer ──────────────────────────────────────────
router.post(
  "/company/:companyId",
  ensureCompanyAccess,
  [
    body("firstName").notEmpty().withMessage("First name required"),
    body("lastName").notEmpty().withMessage("Last name required"),
    body("phone").notEmpty().withMessage("Phone required"),
  ],
  validate,
  async (req, res) => {
    try {
      const customer = await db.Customer.create({
        companyId: req.params.companyId,
        ...req.body,
      });
      res.status(201).json(customer);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ error: "Customer with this phone already exists in this company" });
      }
      console.error("Create customer error:", err);
      res.status(500).json({ error: "Failed to create customer" });
    }
  }
);

// ── Update customer ──────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const customer = await db.Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    if (req.user.type !== "admin" && String(req.user.companyId) !== String(customer.companyId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { documents, ...customerData } = req.body;
    await customer.update(customerData);

    // Sync documents: delete removed, add new
    if (documents && Array.isArray(documents)) {
      const existingDocs = await db.CustomerDocument.findAll({
        where: { customerId: customer.id },
      });
      const incomingIds = documents.filter((d) => d.id).map((d) => d.id);

      // Delete docs not in the incoming list
      for (const doc of existingDocs) {
        if (!incomingIds.includes(doc.id)) {
          await doc.destroy();
        }
      }

      // Add new docs (no id means new)
      const newDocs = documents.filter((d) => !d.id);
      if (newDocs.length > 0) {
        await db.CustomerDocument.bulkCreate(
          newDocs.map((doc) => ({
            customerId: customer.id,
            url: doc.url,
            documentType: doc.documentType || "other",
          }))
        );
      }
    }

    // Reload with documents
    const full = await db.Customer.findByPk(customer.id, {
      include: [{ model: db.CustomerDocument, as: "documents" }],
    });

    res.json(full);
  } catch (err) {
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// ── Delete customer ──────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const customer = await db.Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    await customer.destroy();
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

module.exports = router;
