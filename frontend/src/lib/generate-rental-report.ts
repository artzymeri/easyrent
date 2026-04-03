import jsPDF from "jspdf";
import { formatCurrencyValue, getCurrencyInfo } from "./currency-context";

// ─── Types ────────────────────────────────────────────────────
export interface ReportBooking {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  totalDays: number;
  dailyRate: number;
  subtotal: number;
  discount: number;
  extraCharges: number;
  amountPaid: number;
  paymentStatus: string;
  pickupLocation: string;
  returnLocation: string;
  mileageOut: number | null;
  mileageIn: number | null;
  notes: string | null;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    idNumber?: string;
    driversLicense?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  car: {
    make: string;
    model: string;
    licensePlate: string;
    color: string;
    year?: number;
    vin?: string;
    fuelType?: string;
    transmission?: string;
    mileage?: number;
  };
  createdBy?: { firstName: string; lastName: string };
  createdAt: string;
}

export interface ReportCompany {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface TranslationFn {
  (key: string, params?: Record<string, string>): string;
}

// ─── Colors ───────────────────────────────────────────────────
const PRIMARY = [37, 99, 235] as const;     // blue-600
const DARK = [15, 23, 42] as const;         // slate-900
const MEDIUM = [71, 85, 105] as const;      // slate-500
const LIGHT = [148, 163, 184] as const;     // slate-400
const BORDER = [226, 232, 240] as const;    // slate-200
const BG_LIGHT = [248, 250, 252] as const;  // slate-50
const WHITE = [255, 255, 255] as const;

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

/** Translate a DB enum value (e.g. "diesel") using carsPage i18n keys */
function translateCarValue(
  t: TranslationFn,
  category: string,
  value: string | undefined,
): string {
  if (!value) return "—";
  const translated = t(`carsPage.${category}.${value.toLowerCase()}`);
  // If the key wasn't found, t() returns the key path — fall back to capitalized raw value
  if (translated.startsWith("carsPage.")) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return translated;
}

/** Load an image from a URL and return as base64 data URL */
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─── Main generator ──────────────────────────────────────────
export async function generateRentalReport(
  booking: ReportBooking,
  company: ReportCompany,
  currencyCode: string,
  t: TranslationFn,
) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = 210;
  const marginL = 15;
  const marginR = 15;
  const contentW = pageW - marginL - marginR;
  const colMid = marginL + contentW / 2 + 5;
  const fc = (val: number) => formatCurrencyValue(val, getCurrencyInfo(currencyCode));

  // Load images in parallel
  const [carImgData, fuelImgData] = await Promise.all([
    loadImageAsBase64("/car-vector.webp"),
    loadImageAsBase64("/fuel.jpg"),
  ]);

  let y = 15;

  // ── HEADER BAR ─────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 32, "F");

  // Company name
  doc.setTextColor(...WHITE);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(company.name, marginL, 14);

  // Company contact
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const contactParts: string[] = [];
  if (company.phone) contactParts.push(company.phone);
  if (company.email) contactParts.push(company.email);
  if (company.address) {
    let addr = company.address;
    if (company.city) addr += `, ${company.city}`;
    if (company.country) addr += `, ${company.country}`;
    contactParts.push(addr);
  }
  if (contactParts.length > 0) {
    doc.text(contactParts.join("  |  "), marginL, 21);
  }

  // Report title on the right
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(t("report.title"), pageW - marginR, 14, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`#${String(booking.id).padStart(6, "0")}`, pageW - marginR, 21, { align: "right" });
  doc.text(formatDate(booking.createdAt), pageW - marginR, 27, { align: "right" });

  y = 40;

  // ── SECTION: Customer Information ──────────────────────────
  y = drawSectionHeader(doc, t("report.customerInfo"), marginL, y, contentW);

  const customer = booking.customer;
  const customerRows: [string, string][] = [
    [t("report.fullName"), `${customer.firstName} ${customer.lastName}`],
  ];
  if (customer.phone) customerRows.push([t("report.phone"), customer.phone]);
  if (customer.email) customerRows.push([t("report.email"), customer.email]);
  if (customer.idNumber) customerRows.push([t("report.idNumber"), customer.idNumber]);
  if (customer.driversLicense) customerRows.push([t("report.driversLicense"), customer.driversLicense]);
  if (customer.dateOfBirth) customerRows.push([t("report.dateOfBirth"), formatDate(customer.dateOfBirth)]);
  if (customer.address) {
    let addr = customer.address;
    if (customer.city) addr += `, ${customer.city}`;
    if (customer.country) addr += `, ${customer.country}`;
    customerRows.push([t("report.address"), addr]);
  }

  y = drawKeyValueGrid(doc, customerRows, marginL, y, contentW);
  y += 6;

  // ── SECTION: Vehicle Information ───────────────────────────
  y = drawSectionHeader(doc, t("report.vehicleInfo"), marginL, y, contentW);

  const car = booking.car;
  const vehicleRows: [string, string][] = [
    [t("report.vehicle"), `${car.make} ${car.model}${car.year ? ` (${car.year})` : ""}`],
    [t("report.licensePlate"), car.licensePlate || "—"],
    [t("report.color"), translateCarValue(t, "colors", car.color)],
  ];
  if (car.vin) vehicleRows.push([t("report.vin"), car.vin]);
  if (car.fuelType) vehicleRows.push([t("report.fuelType"), translateCarValue(t, "fuelTypes", car.fuelType)]);
  if (car.transmission) vehicleRows.push([t("report.transmission"), translateCarValue(t, "transmissions", car.transmission)]);
  if (car.mileage) vehicleRows.push([t("report.mileage"), `${car.mileage.toLocaleString()} km`]);

  y = drawKeyValueGrid(doc, vehicleRows, marginL, y, contentW);
  y += 6;

  // ── SECTION: Rental Period ─────────────────────────────────
  y = drawSectionHeader(doc, t("report.rentalPeriod"), marginL, y, contentW);

  const rentalRows: [string, string][] = [
    [t("report.pickupDate"), formatDateTime(booking.startDate)],
    [t("report.returnDate"), formatDateTime(booking.endDate)],
    [t("report.totalDays"), String(booking.totalDays)],
  ];
  if (booking.pickupLocation) rentalRows.push([t("report.pickupLocation"), booking.pickupLocation]);
  if (booking.returnLocation) rentalRows.push([t("report.returnLocation"), booking.returnLocation]);
  if (booking.mileageOut != null) rentalRows.push([t("report.mileageOut"), `${booking.mileageOut.toLocaleString()} km`]);
  if (booking.mileageIn != null) rentalRows.push([t("report.mileageIn"), `${booking.mileageIn.toLocaleString()} km`]);

  y = drawKeyValueGrid(doc, rentalRows, marginL, y, contentW);
  y += 6;

  // ── SECTION: Financial Summary ─────────────────────────────
  y = drawSectionHeader(doc, t("report.financialSummary"), marginL, y, contentW);

  // Financial table
  const finRows: [string, string, boolean?][] = [
    [t("report.dailyRate"), fc(booking.dailyRate)],
    [`${booking.totalDays} × ${fc(booking.dailyRate)}`, fc(booking.subtotal)],
  ];
  if (Number(booking.discount) > 0) {
    finRows.push([t("report.discount"), `- ${fc(booking.discount)}`]);
  }
  if (Number(booking.extraCharges) > 0) {
    finRows.push([t("report.extraCharges"), `+ ${fc(booking.extraCharges)}`]);
  }

  y = drawFinancialTable(doc, finRows, marginL, y, contentW);

  // Total row
  doc.setFillColor(...PRIMARY);
  doc.rect(marginL, y, contentW, 10, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(t("report.totalAmount"), marginL + 5, y + 7);
  doc.text(fc(booking.totalAmount), marginL + contentW - 5, y + 7, { align: "right" });
  y += 14;

  // Amount paid
  doc.setTextColor(...DARK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(t("report.amountPaid"), marginL + 5, y);
  doc.text(fc(booking.amountPaid), marginL + contentW - 5, y, { align: "right" });
  y += 5;

  const remaining = Number(booking.totalAmount) - Number(booking.amountPaid);
  if (remaining > 0) {
    doc.setFont("helvetica", "bold");
    doc.text(t("report.remaining"), marginL + 5, y);
    doc.text(fc(remaining), marginL + contentW - 5, y, { align: "right" });
  }
  y += 10;

  // ── SECTION: Notes ─────────────────────────────────────────
  if (booking.notes) {
    y = drawSectionHeader(doc, t("report.notes"), marginL, y, contentW);
    doc.setTextColor(...MEDIUM);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(booking.notes, contentW - 10);
    doc.text(noteLines, marginL + 5, y + 2);
    y += noteLines.length * 4.5 + 6;
  }

  // ── PAGE 2: Vehicle Diagram + Fuel Gauge + Terms ───────────
  doc.addPage();
  y = 20;

  // ── Car Diagram Section ────────────────────────────────────
  y = drawSectionHeader(doc, t("report.carDiagram"), marginL, y, contentW);

  if (carImgData) {
    const carImgW = 70;
    const carImgH = 100;
    const carImgX = marginL + (contentW - carImgW) / 2;

    // Dashed border around the diagram area
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 2], 0);
    const boxPad = 6;
    doc.rect(carImgX - boxPad, y - 3, carImgW + boxPad * 2, carImgH + 6);
    doc.setLineDashPattern([], 0);

    doc.addImage(carImgData, "WEBP", carImgX, y, carImgW, carImgH);
    y += carImgH + 10;
  } else {
    // Placeholder
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(marginL + 20, y, contentW - 40, 70);
    doc.setLineDashPattern([], 0);
    doc.setTextColor(...LIGHT);
    doc.setFontSize(10);
    doc.text(t("report.carDiagram"), pageW / 2, y + 35, { align: "center" });
    y += 78;
  }

  // Damage notes area — lines for handwriting
  doc.setTextColor(...DARK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(t("report.damageNotes") + ":", marginL, y);
  y += 6;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  for (let i = 0; i < 3; i++) {
    doc.line(marginL, y, marginL + contentW, y);
    y += 7;
  }
  y += 6;

  // ── Fuel Gauge Section ─────────────────────────────────────
  y = drawSectionHeader(doc, t("report.fuelLevel"), marginL, y, contentW);

  if (fuelImgData) {
    const fuelImgW = 55;
    const fuelImgH = 40;
    const fuelImgX = marginL + (contentW - fuelImgW) / 2;

    // Light background box
    doc.setFillColor(...BG_LIGHT);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    const fuelBoxPad = 8;
    doc.roundedRect(
      fuelImgX - fuelBoxPad,
      y - 3,
      fuelImgW + fuelBoxPad * 2,
      fuelImgH + 6,
      2,
      2,
      "FD",
    );

    doc.addImage(fuelImgData, "JPEG", fuelImgX, y, fuelImgW, fuelImgH);
    y += fuelImgH + 10;
  } else {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(marginL + 30, y, contentW - 60, 35);
    doc.setLineDashPattern([], 0);
    doc.setTextColor(...LIGHT);
    doc.setFontSize(10);
    doc.text(t("report.fuelLevel"), pageW / 2, y + 17, { align: "center" });
    y += 43;
  }

  y += 4;

  // ── SECTION: Terms & Conditions ────────────────────────────
  y = drawSectionHeader(doc, t("report.termsTitle"), marginL, y, contentW);
  doc.setTextColor(...MEDIUM);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");

  const terms = [
    t("report.term1"),
    t("report.term2"),
    t("report.term3"),
    t("report.term4"),
    t("report.term5"),
  ];
  terms.forEach((term, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${term}`, contentW - 10);
    doc.text(lines, marginL + 5, y + 2);
    y += lines.length * 3.5 + 2;
  });
  y += 8;

  // ── SIGNATURE SECTION ──────────────────────────────────────
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  const sigBoxW = (contentW - 20) / 2;

  // Left: Renter
  doc.setDrawColor(...BORDER);
  doc.setTextColor(...DARK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(t("report.renterSignature"), marginL, y);
  y += 3;
  doc.setLineWidth(0.3);
  doc.line(marginL, y + 20, marginL + sigBoxW, y + 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MEDIUM);
  doc.text(`${customer.firstName} ${customer.lastName}`, marginL, y + 25);

  // Right: Company
  doc.setTextColor(...DARK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(t("report.companySignature"), colMid, y - 3);
  doc.line(colMid, y + 20, colMid + sigBoxW, y + 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MEDIUM);
  doc.text(company.name, colMid, y + 25);

  y += 35;

  // ── FOOTER (all pages) ─────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const footerY = 285;
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(marginL, footerY - 3, pageW - marginR, footerY - 3);
    doc.setTextColor(...LIGHT);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${t("report.generatedOn")} ${new Date().toLocaleString()} — ${company.name}`,
      pageW / 2,
      footerY,
      { align: "center" },
    );
    doc.text(`${p} / ${totalPages}`, pageW - marginR, footerY, { align: "right" });
  }

  // ── Download ───────────────────────────────────────────────
  const startDateFormatted = new Date(booking.startDate).toISOString().split("T")[0];
  const customerName = `${customer.firstName}_${customer.lastName}`.replace(/\s+/g, "_");
  const carName = `${car.make}_${car.model}`.replace(/\s+/g, "_");
  const fileName = `${customerName}_${carName}_${startDateFormatted}.pdf`;

  doc.save(fileName);
}

// ─── Drawing Helpers ──────────────────────────────────────────

function drawSectionHeader(
  doc: jsPDF,
  title: string,
  x: number,
  y: number,
  w: number,
): number {
  doc.setFillColor(...BG_LIGHT);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, 8, 1, 1, "FD");
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title, x + 4, y + 5.5);
  return y + 12;
}

function drawKeyValueGrid(
  doc: jsPDF,
  rows: [string, string][],
  x: number,
  y: number,
  totalW: number,
): number {
  const colW = (totalW - 10) / 2;
  const labelX1 = x + 5;
  const valueX1 = x + 5;
  const labelX2 = x + colW + 15;
  const valueX2 = x + colW + 15;

  doc.setFontSize(8.5);

  // Lay out in 2 columns
  for (let i = 0; i < rows.length; i += 2) {
    // Alt row bg
    if (Math.floor(i / 2) % 2 === 0) {
      doc.setFillColor(...BG_LIGHT);
      doc.rect(x, y - 1, totalW, 10, "F");
    }

    // Left column
    doc.setTextColor(...MEDIUM);
    doc.setFont("helvetica", "normal");
    doc.text(rows[i][0], labelX1, y + 3);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(rows[i][1], valueX1, y + 7);

    // Right column
    if (i + 1 < rows.length) {
      doc.setTextColor(...MEDIUM);
      doc.setFont("helvetica", "normal");
      doc.text(rows[i + 1][0], labelX2, y + 3);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "bold");
      doc.text(rows[i + 1][1], valueX2, y + 7);
    }

    y += 11;
  }

  return y;
}

function drawFinancialTable(
  doc: jsPDF,
  rows: [string, string, boolean?][],
  x: number,
  y: number,
  totalW: number,
): number {
  doc.setFontSize(9);

  rows.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(...BG_LIGHT);
      doc.rect(x, y - 1, totalW, 8, "F");
    }
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.1);
    doc.line(x, y + 7, x + totalW, y + 7);

    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    doc.text(row[0], x + 5, y + 5);
    doc.setFont("helvetica", "bold");
    doc.text(row[1], x + totalW - 5, y + 5, { align: "right" });
    y += 8;
  });

  return y;
}
