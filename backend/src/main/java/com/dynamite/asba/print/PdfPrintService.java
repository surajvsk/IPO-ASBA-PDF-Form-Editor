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
import java.util.Map;

@Service
public class PdfPrintService {

    private static final int MAX_BATCH = 200;

    public byte[] print(byte[] pdfBytes, PrintRequest request) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new PrintException("Upload a PDF first.");
        }
        if (request == null || request.getCoordinates() == null || request.getCoordinates().isEmpty()) {
            throw new PrintException("Turn on at least one field before printing.");
        }
        List<Map<String, Object>> records = request.getRecords();
        if (records != null && !records.isEmpty()) {
            return printBatch(pdfBytes, request);
        }
        return printOnce(pdfBytes, request.getCoordinates());
    }

    private byte[] printOnce(byte[] pdfBytes, List<FieldPlacement> fields) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (PdfReader reader = new PdfReader(new ByteArrayInputStream(pdfBytes));
             PdfWriter writer = new PdfWriter(output);
             PdfDocument document = new PdfDocument(reader, writer)) {
            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            int pageCount = document.getNumberOfPages();
            for (FieldPlacement field : fields) {
                stamp(document, field.getFontWeight() >= 600 ? bold : regular, field, pageCount, 0, null);
            }
        } catch (PrintException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new PrintException("Could not read that PDF.");
        }
        return output.toByteArray();
    }

    private byte[] printBatch(byte[] pdfBytes, PrintRequest request) {
        List<Map<String, Object>> records = request.getRecords();
        if (records.size() > MAX_BATCH) {
            throw new PrintException("A batch can print at most " + MAX_BATCH + " forms.");
        }
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (PdfReader reader = new PdfReader(new ByteArrayInputStream(pdfBytes));
             PdfDocument source = new PdfDocument(reader);
             PdfWriter writer = new PdfWriter(output);
             PdfDocument document = new PdfDocument(writer)) {
            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            int templatePages = source.getNumberOfPages();
            if (templatePages < 1) {
                throw new PrintException("Could not read that PDF.");
            }
            for (int index = 0; index < records.size(); index++) {
                int offset = document.getNumberOfPages();
                source.copyPagesTo(1, templatePages, document);
                Map<String, Object> record = records.get(index);
                for (FieldPlacement field : request.getCoordinates()) {
                    PdfFont font = field.getFontWeight() >= 600 ? bold : regular;
                    stamp(document, font, field, templatePages, offset, record);
                }
            }
        } catch (PrintException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new PrintException("Could not read that PDF.");
        }
        return output.toByteArray();
    }

    private void stamp(
            PdfDocument document,
            PdfFont font,
            FieldPlacement field,
            int templatePages,
            int pageOffset,
            Map<String, Object> record) {
        String label = field.getKey() == null || field.getKey().isBlank() ? "field" : field.getKey();
        String text = valueFor(field, record);
        if (field.getCellWidth() <= 0 && field.getGap() == 0 && field.getWordspaceCount() > 0) {
            text = TextSpacing.apply(text, field.getWordspaceCount());
        }
        if (text.isEmpty()) {
            return;
        }
        if (field.getPage() < 1 || field.getPage() > templatePages) {
            throw new PrintException(label + " is set to page " + field.getPage()
                    + ", but this PDF has " + templatePages + " page(s).");
        }

        float size = field.getFontSize() > 0 ? field.getFontSize() : 12f;
        PdfPage page = document.getPage(pageOffset + field.getPage());
        PdfCanvas canvas = new PdfCanvas(page);
        if (field.getCellWidth() > 0) {
            try {
                stampCells(canvas, font, field, text, size);
            } catch (PrintException exception) {
                throw exception;
            } catch (RuntimeException exception) {
                throw new PrintException(label + " could not be printed. Use letters and numbers supported by Helvetica.");
            }
            return;
        }

        canvas.beginText();
        try {
            boolean bold = field.getFontWeight() >= 600;
            List<String> lines = TextLayout.wrap(text, size, field.getGap(), field.getBreakWidth(), bold);
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
        } catch (PrintException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new PrintException(label + " could not be printed. Use letters and numbers supported by Helvetica.");
        } finally {
            canvas.endText();
        }
    }

    private void stampCells(PdfCanvas canvas, PdfFont font, FieldPlacement field, String text, float size) {
        float cell = field.getCellWidth();
        canvas.setFillColor(ColorConstants.BLACK);
        for (int index = 0; index < text.length(); index++) {
            String glyph = text.substring(index, index + 1);
            if (glyph.isBlank()) {
                continue;
            }
            float glyphWidth = font.getWidth(glyph, size);
            float left = field.getX() + index * cell + Math.max(0f, (cell - glyphWidth) / 2f);
            canvas.beginText();
            try {
                canvas.setFontAndSize(font, size);
                canvas.moveText(left, field.getY());
                canvas.showText(glyph);
            } finally {
                canvas.endText();
            }
        }
    }

    private String valueFor(FieldPlacement field, Map<String, Object> record) {
        if (record != null && field.getKey() != null && record.containsKey(field.getKey())) {
            Object value = record.get(field.getKey());
            return value == null ? "" : String.valueOf(value);
        }
        return field.getValue() == null ? "" : field.getValue();
    }
}
