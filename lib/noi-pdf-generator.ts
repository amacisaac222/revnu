/**
 * NOI PDF Generator
 *
 * Generates professional PDF documents for Notice of Intent to Lien letters.
 * Uses jsPDF for client-side or server-side PDF generation.
 */

import jsPDF from "jspdf";
import type { NOITemplateData } from "./noi-templates";

export interface PDFOptions {
  includeLetterhead?: boolean;
  includeFooter?: boolean;
  logoUrl?: string;
  fontSize?: number;
  lineSpacing?: number;
}

/**
 * Generate NOI PDF from letter text
 */
export function generateNOIPDF(
  noiText: string,
  templateData: NOITemplateData,
  options: PDFOptions = {}
): jsPDF {
  const {
    includeLetterhead = true,
    includeFooter = true,
    fontSize = 11,
    lineSpacing = 1.5,
  } = options;

  // Create new PDF document (Letter size: 8.5" x 11")
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter",
  });

  const pageWidth = 8.5;
  const pageHeight = 11;
  const margin = 0.75;
  const contentWidth = pageWidth - margin * 2;

  let yPosition = margin;

  // Add letterhead if requested
  if (includeLetterhead) {
    yPosition = addLetterhead(doc, templateData, yPosition, margin, contentWidth);
  }

  // Add main NOI letter content
  yPosition = addLetterContent(doc, noiText, yPosition, margin, contentWidth, fontSize, lineSpacing);

  // Add footer if requested
  if (includeFooter) {
    addFooter(doc, templateData, pageHeight, margin, contentWidth);
  }

  // Add page numbers
  addPageNumbers(doc);

  return doc;
}

/**
 * Add professional letterhead to PDF
 */
function addLetterhead(
  doc: jsPDF,
  data: NOITemplateData,
  yPosition: number,
  margin: number,
  contentWidth: number
): number {
  // Company name (large, bold)
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(data.contractorName, margin, yPosition);
  yPosition += 0.25;

  // Contact information (smaller)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.contractorAddress, margin, yPosition);
  yPosition += 0.15;

  doc.text(
    `${data.contractorCity}, ${data.contractorState} ${data.contractorZip}`,
    margin,
    yPosition
  );
  yPosition += 0.15;

  doc.text(data.contractorPhone, margin, yPosition);
  yPosition += 0.15;

  doc.text(data.contractorEmail, margin, yPosition);
  yPosition += 0.15;

  if (data.contractorLicenseNumber) {
    doc.text(`License #${data.contractorLicenseNumber}`, margin, yPosition);
    yPosition += 0.15;
  }

  // Horizontal line separator
  yPosition += 0.1;
  doc.setLineWidth(0.01);
  doc.line(margin, yPosition, margin + contentWidth, yPosition);
  yPosition += 0.3;

  return yPosition;
}

/**
 * Add main letter content with proper formatting
 */
function addLetterContent(
  doc: jsPDF,
  noiText: string,
  yPosition: number,
  margin: number,
  contentWidth: number,
  fontSize: number,
  lineSpacing: number
): number {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "normal");

  // Split text into lines
  const lines = noiText.split("\n");
  const lineHeight = (fontSize / 72) * lineSpacing; // Convert points to inches

  for (const line of lines) {
    // Check for page break
    if (yPosition > 10) {
      // Near bottom of page
      doc.addPage();
      yPosition = 0.75; // Reset to top margin
    }

    // Handle empty lines (paragraph spacing)
    if (line.trim() === "") {
      yPosition += lineHeight * 0.5;
      continue;
    }

    // Handle bold headers (lines starting with **)
    if (line.startsWith("**") && line.endsWith("**")) {
      doc.setFont("helvetica", "bold");
      const boldText = line.replace(/\*\*/g, "");
      const wrappedBold = doc.splitTextToSize(boldText, contentWidth);
      doc.text(wrappedBold, margin, yPosition);
      yPosition += wrappedBold.length * lineHeight;
      doc.setFont("helvetica", "normal");
      continue;
    }

    // Handle special formatting
    let currentLine = line;
    let fontStyle: "normal" | "bold" = "normal";

    // Check for bold sections within line
    if (currentLine.includes("**")) {
      // For simplicity, treat entire line as bold if it contains **
      fontStyle = "bold";
      currentLine = currentLine.replace(/\*\*/g, "");
    }

    doc.setFont("helvetica", fontStyle);

    // Wrap long lines
    const wrappedText = doc.splitTextToSize(currentLine, contentWidth);
    doc.text(wrappedText, margin, yPosition);
    yPosition += wrappedText.length * lineHeight;
  }

  return yPosition;
}

/**
 * Add footer with legal disclaimer
 */
function addFooter(
  doc: jsPDF,
  data: NOITemplateData,
  pageHeight: number,
  margin: number,
  contentWidth: number
): void {
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer line
    const footerY = pageHeight - 0.6;
    doc.setLineWidth(0.01);
    doc.line(margin, footerY, margin + contentWidth, footerY);

    // Footer text
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const footerText = `This notice is sent by ${data.contractorName}, not by a debt collection agency.`;
    doc.text(footerText, margin, footerY + 0.15, { maxWidth: contentWidth });
  }
}

/**
 * Add page numbers to all pages
 */
function addPageNumbers(doc: jsPDF): void {
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const pageText = `Page ${i} of ${totalPages}`;
    const textWidth = doc.getTextWidth(pageText);
    doc.text(pageText, 8.5 - 0.75 - textWidth, 11 - 0.4);
  }
}

/**
 * Generate PDF and return as Blob (for download)
 */
export function generateNOIPDFBlob(
  noiText: string,
  templateData: NOITemplateData,
  options?: PDFOptions
): Blob {
  const doc = generateNOIPDF(noiText, templateData, options);
  return doc.output("blob");
}

/**
 * Generate PDF and return as base64 string
 */
export function generateNOIPDFBase64(
  noiText: string,
  templateData: NOITemplateData,
  options?: PDFOptions
): string {
  const doc = generateNOIPDF(noiText, templateData, options);
  return doc.output("dataurlstring");
}

/**
 * Generate PDF and trigger download in browser
 */
export function downloadNOIPDF(
  noiText: string,
  templateData: NOITemplateData,
  filename: string,
  options?: PDFOptions
): void {
  const doc = generateNOIPDF(noiText, templateData, options);
  doc.save(filename);
}

/**
 * Generate filename for NOI PDF
 */
export function generateNOIFilename(
  invoiceNumber: string,
  customerName: string,
  date: Date = new Date()
): string {
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const cleanCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, "_");
  return `NOI_${invoiceNumber}_${cleanCustomerName}_${dateStr}.pdf`;
}
