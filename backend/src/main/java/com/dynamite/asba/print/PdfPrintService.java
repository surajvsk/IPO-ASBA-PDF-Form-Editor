package com.dynamite.asba.print;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfPrintService {

    public byte[] print(byte[] pdfBytes, PrintRequest request) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new PrintException("Upload a PDF first.");
        }
        if (request == null || request.getCoordinates() == null || request.getCoordinates().isEmpty()) {
            throw new PrintException("Turn on at least one field before printing.");
        }

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (PdfReader reader = new PdfReader(new ByteArrayInputStream(pdfBytes));
             PdfWriter writer = new PdfWriter(output);
             PdfDocument document = new PdfDocument(reader, writer)) {
            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            int pageCount = document.getNumberOfPages();
            for (FieldPlacement field : request.getCoordinates()) {
                PdfFont font = field.getFontWeight() >= 600 ? bold : regular;
                stamp(document, font, field, pageCount);
            }
        } catch (PrintException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new PrintException("Could not read that PDF.");
        }
        return output.toByteArray();
    }

    private void stamp(PdfDocument document, PdfFont font, FieldPlacement field, int pageCount) {
        String label = field.getKey() == null || field.getKey().isBlank() ? "field" : field.getKey();
        String text = field.getValue() == null ? "" : field.getValue();
        if (field.getGap() == 0 && field.getWordspaceCount() > 0) {
            text = TextSpacing.apply(text, field.getWordspaceCount());
        }
        if (text.isEmpty()) {
            return;
        }
        if (field.getPage() < 1 || field.getPage() > pageCount) {
            throw new PrintException(label + " is set to page " + field.getPage()
                    + ", but this PDF has " + pageCount + " page(s).");
        }

        float size = field.getFontSize() > 0 ? field.getFontSize() : 12f;
        boolean bold = field.getFontWeight() >= 600;
        List<String> lines = TextLayout.wrap(text, size, field.getGap(), field.getBreakWidth(), bold);
        PdfPage page = document.getPage(field.getPage());
        PdfCanvas canvas = new PdfCanvas(page);
        canvas.beginText();
        try {
            canvas.setFontAndSize(font, size);
            canvas.setCharacterSpacing(Math.max(0f, field.getGap()));
            canvas.setFillColor(ColorConstants.BLACK);
            canvas.moveText(field.getX(), field.getY());
            float leading = size * 1.15f;
            for (int index = 0; index < lines.size(); index++) {
                if (index > 0) {
                    canvas.moveText(0, -leading);
                }
                canvas.showText(lines.get(index));
            }
        } catch (RuntimeException exception) {
            throw new PrintException(label + " could not be printed. Use letters and numbers supported by Helvetica.");
        } finally {
            canvas.endText();
        }
    }
}
