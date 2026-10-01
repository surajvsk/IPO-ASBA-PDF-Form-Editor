import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { sampleFields } from "../data/fields";

export async function buildSamplePdf() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([595.28, 841.89]);

  page.drawText("Sample ASBA practice form", {
    x: 40,
    y: 800,
    size: 16,
    font: bold,
    color: rgb(0.1, 0.14, 0.2),
  });
  page.drawText("Load the sample keys or add your own, then drag them into the boxes.", {
    x: 40,
    y: 778,
    size: 10,
    font,
    color: rgb(0.25, 0.3, 0.35),
  });

  sampleFields().forEach((field) => {
    page.drawText(field.key, {
      x: 40,
      y: field.y,
      size: 8,
      font,
      color: rgb(0.2, 0.24, 0.3),
    });
    page.drawRectangle({
      x: 198,
      y: field.y - 4,
      width: 360,
      height: 16,
      borderWidth: 0.7,
      borderColor: rgb(0.55, 0.6, 0.66),
      color: rgb(0.97, 0.98, 0.99),
    });
  });

  const page2 = pdf.addPage([595.28, 841.89]);
  page2.drawText("Page 2", {
    x: 40,
    y: 800,
    size: 16,
    font: bold,
  });
  page2.drawText("Set a field's page to 2, then drag it on this page.", {
    x: 40,
    y: 776,
    size: 11,
    font,
  });

  return pdf.save();
}
