const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const db = require("../db");

router.use(authenticate);

// Middleware: ensure staff is manager
function ensureManager(req, res, next) {
  if (req.user.type === "admin") return next();
  if (req.user.role !== "manager") return res.status(403).json({ error: "Only managers can manage website" });
  next();
}

router.use(ensureManager);

// ─────────────────────────────────────────────
// WEBSITE SETTINGS
// ─────────────────────────────────────────────

// GET /website/settings — Get website config
router.get("/settings", async (req, res) => {
  try {
    const company = await db.Company.findByPk(req.user.companyId, {
      attributes: [
        "websiteTemplate", "websitePublished", "heroSlideSource",
        "websiteNavLinks", "websitePrimaryColor", "websiteHeroTitle", "websiteHeroSubtitle",
      ],
    });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (err) {
    console.error("Get website settings error:", err);
    res.status(500).json({ error: "Failed to fetch website settings" });
  }
});

// PUT /website/settings — Update website config
router.put("/settings", async (req, res) => {
  try {
    const {
      websiteTemplate, websitePublished, heroSlideSource,
      websiteNavLinks, websitePrimaryColor, websiteHeroTitle, websiteHeroSubtitle,
    } = req.body;

    const updates = {};
    if (websiteTemplate !== undefined) updates.websiteTemplate = websiteTemplate;
    if (websitePublished !== undefined) updates.websitePublished = websitePublished;
    if (heroSlideSource !== undefined) updates.heroSlideSource = heroSlideSource;
    if (websiteNavLinks !== undefined) updates.websiteNavLinks = websiteNavLinks;
    if (websitePrimaryColor !== undefined) updates.websitePrimaryColor = websitePrimaryColor;
    if (websiteHeroTitle !== undefined) updates.websiteHeroTitle = websiteHeroTitle;
    if (websiteHeroSubtitle !== undefined) updates.websiteHeroSubtitle = websiteHeroSubtitle;

    await db.Company.update(updates, { where: { id: req.user.companyId } });

    const company = await db.Company.findByPk(req.user.companyId, {
      attributes: [
        "websiteTemplate", "websitePublished", "heroSlideSource",
        "websiteNavLinks", "websitePrimaryColor", "websiteHeroTitle", "websiteHeroSubtitle",
      ],
    });
    res.json(company);
  } catch (err) {
    console.error("Update website settings error:", err);
    res.status(500).json({ error: "Failed to update website settings" });
  }
});

// ─────────────────────────────────────────────
// SLIDES
// ─────────────────────────────────────────────

// GET /website/slides
router.get("/slides", async (req, res) => {
  try {
    const slides = await db.WebsiteSlide.findAll({
      where: { companyId: req.user.companyId },
      order: [["sortOrder", "ASC"], ["id", "ASC"]],
    });
    res.json(slides);
  } catch (err) {
    console.error("Get slides error:", err);
    res.status(500).json({ error: "Failed to fetch slides" });
  }
});

// POST /website/slides
router.post("/slides", [
  body("imageUrl").optional(),
  body("title").optional(),
  validate,
], async (req, res) => {
  try {
    const { title, subtitle, imageUrl, buttonText, buttonLink, sortOrder } = req.body;
    const count = await db.WebsiteSlide.count({ where: { companyId: req.user.companyId } });
    const slide = await db.WebsiteSlide.create({
      companyId: req.user.companyId,
      title, subtitle, imageUrl, buttonText, buttonLink,
      sortOrder: sortOrder ?? count,
    });
    res.status(201).json(slide);
  } catch (err) {
    console.error("Create slide error:", err);
    res.status(500).json({ error: "Failed to create slide" });
  }
});

// PUT /website/slides/:id
router.put("/slides/:id", async (req, res) => {
  try {
    const slide = await db.WebsiteSlide.findOne({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!slide) return res.status(404).json({ error: "Slide not found" });

    const { title, subtitle, imageUrl, buttonText, buttonLink, sortOrder, isActive } = req.body;
    await slide.update({
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(buttonText !== undefined && { buttonText }),
      ...(buttonLink !== undefined && { buttonLink }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
    });
    res.json(slide);
  } catch (err) {
    console.error("Update slide error:", err);
    res.status(500).json({ error: "Failed to update slide" });
  }
});

// PUT /website/slides/reorder — Bulk reorder
router.put("/slides-reorder", async (req, res) => {
  try {
    const { order } = req.body; // [{ id, sortOrder }]
    if (!Array.isArray(order)) return res.status(400).json({ error: "order must be an array" });
    for (const item of order) {
      await db.WebsiteSlide.update(
        { sortOrder: item.sortOrder },
        { where: { id: item.id, companyId: req.user.companyId } }
      );
    }
    const slides = await db.WebsiteSlide.findAll({
      where: { companyId: req.user.companyId },
      order: [["sortOrder", "ASC"]],
    });
    res.json(slides);
  } catch (err) {
    console.error("Reorder slides error:", err);
    res.status(500).json({ error: "Failed to reorder slides" });
  }
});

// DELETE /website/slides/:id
router.delete("/slides/:id", async (req, res) => {
  try {
    const deleted = await db.WebsiteSlide.destroy({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!deleted) return res.status(404).json({ error: "Slide not found" });
    res.status(204).send();
  } catch (err) {
    console.error("Delete slide error:", err);
    res.status(500).json({ error: "Failed to delete slide" });
  }
});

// ─────────────────────────────────────────────
// PAGES (About, Contact)
// ─────────────────────────────────────────────

// GET /website/pages
router.get("/pages", async (req, res) => {
  try {
    const pages = await db.WebsitePage.findAll({
      where: { companyId: req.user.companyId },
      order: [["slug", "ASC"]],
    });
    res.json(pages);
  } catch (err) {
    console.error("Get pages error:", err);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

// GET /website/pages/:slug
router.get("/pages/:slug", async (req, res) => {
  try {
    const page = await db.WebsitePage.findOne({
      where: { companyId: req.user.companyId, slug: req.params.slug },
    });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (err) {
    console.error("Get page error:", err);
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

// PUT /website/pages/:slug — Create or update page
router.put("/pages/:slug", [
  body("title").notEmpty().withMessage("Title is required"),
  validate,
], async (req, res) => {
  try {
    const { title, content, metaDescription, isPublished, heroImageUrl, extraData } = req.body;
    const [page, created] = await db.WebsitePage.findOrCreate({
      where: { companyId: req.user.companyId, slug: req.params.slug },
      defaults: {
        companyId: req.user.companyId,
        slug: req.params.slug,
        title, content, metaDescription, isPublished, heroImageUrl, extraData,
      },
    });
    if (!created) {
      await page.update({ title, content, metaDescription, isPublished, heroImageUrl, extraData });
    }
    res.json(page);
  } catch (err) {
    console.error("Update page error:", err);
    res.status(500).json({ error: "Failed to update page" });
  }
});

// ─────────────────────────────────────────────
// BLOG POSTS
// ─────────────────────────────────────────────

// GET /website/blog
router.get("/blog", async (req, res) => {
  try {
    const posts = await db.BlogPost.findAll({
      where: { companyId: req.user.companyId },
      order: [["createdAt", "DESC"]],
    });
    res.json(posts);
  } catch (err) {
    console.error("Get blog posts error:", err);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// GET /website/blog/:id
router.get("/blog/:id", async (req, res) => {
  try {
    const post = await db.BlogPost.findOne({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error("Get blog post error:", err);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

// POST /website/blog
router.post("/blog", [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  validate,
], async (req, res) => {
  try {
    const { title, content, excerpt, coverImageUrl, isPublished } = req.body;

    // Generate slug
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const existing = await db.BlogPost.findOne({
      where: { companyId: req.user.companyId, slug },
    });
    if (existing) slug += `-${Date.now()}`;

    const post = await db.BlogPost.create({
      companyId: req.user.companyId,
      title, slug, content, excerpt, coverImageUrl,
      authorName: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim(),
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
    });
    res.status(201).json(post);
  } catch (err) {
    console.error("Create blog post error:", err);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

// PUT /website/blog/:id
router.put("/blog/:id", async (req, res) => {
  try {
    const post = await db.BlogPost.findOne({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const { title, content, excerpt, coverImageUrl, isPublished } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (coverImageUrl !== undefined) updates.coverImageUrl = coverImageUrl;
    if (isPublished !== undefined) {
      updates.isPublished = isPublished;
      if (isPublished && !post.publishedAt) updates.publishedAt = new Date();
    }

    await post.update(updates);
    res.json(post);
  } catch (err) {
    console.error("Update blog post error:", err);
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

// DELETE /website/blog/:id
router.delete("/blog/:id", async (req, res) => {
  try {
    const deleted = await db.BlogPost.destroy({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!deleted) return res.status(404).json({ error: "Post not found" });
    res.status(204).send();
  } catch (err) {
    console.error("Delete blog post error:", err);
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

module.exports = router;
