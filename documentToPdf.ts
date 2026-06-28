// src/lib/documentToPdf.ts
//
// Converts a generated document's Markdown content into a formatted PDF
// using jsPDF. This is a deliberately simple Markdown renderer — it handles
// the subset of Markdown Claude actually produces in generateDocument.ts
// (headers, bullet lists, plain paragraphs, a horizontal rule before the
// disclaimer) rather than pulling in a full Markdown parser dependency.

import { jsPDF } from "jspdf";

const PAGE_MARGIN = 56;
const PAGE_WIDTH = 595; // A4 in points
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const LINE_HEIGHT = 16;

export function generateDocumentPdf(params: {
  title: string;
  businessName: string;
  generatedAt: Date;
  markdownContent: string;
}): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = PAGE_MARGIN;

  function ensureSpace(linesNeeded: number) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + linesNeeded * LINE_HEIGHT > pageHeight - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
  }

  function writeWrapped(text: string, fontSize: number, fontStyle: "normal" | "bold" = "normal") {
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH) as string[];
    ensureSpace(lines.length);
    doc.text(lines, PAGE_MARGIN, y);
    y += lines.length * LINE_HEIGHT;
  }

  // --- Cover header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(params.title, PAGE_MARGIN, y);
  y += 26;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text(
    `${params.businessName}  ·  Generated ${params.generatedAt.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    PAGE_MARGIN,
    y
  );
  y += 28;
  doc.setTextColor(0, 0, 0);

  // --- Body: minimal Markdown rendering ---
  const lines = params.markdownContent.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === "" ) {
      y += LINE_HEIGHT * 0.5;
      continue;
    }
    if (line === "---") {
      ensureSpace(1);
      doc.setDrawColor(200, 200, 200);
      doc.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);
      y += LINE_HEIGHT;
      continue;
    }
    if (line.startsWith("# ")) {
      y += 6;
      writeWrapped(line.replace(/^#\s+/, ""), 16, "bold");
      y += 4;
      continue;
    }
    if (line.startsWith("## ")) {
      y += 5;
      writeWrapped(line.replace(/^##\s+/, ""), 13, "bold");
      y += 3;
      continue;
    }
    if (line.startsWith("### ")) {
      y += 4;
      writeWrapped(line.replace(/^###\s+/, ""), 11.5, "bold");
      y += 2;
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      writeWrapped(`•  ${line.slice(2)}`, 10.5);
      continue;
    }
    if (line.startsWith("*") && line.endsWith("*") && line.length > 2) {
      // italic disclaimer line — render smaller and gray
      doc.setTextColor(120, 120, 120);
      writeWrapped(line.replace(/^\*|\*$/g, ""), 9);
      doc.setTextColor(0, 0, 0);
      continue;
    }

    writeWrapped(line, 10.5);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
