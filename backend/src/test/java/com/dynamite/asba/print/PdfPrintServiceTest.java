package com.dynamite.asba.print;

import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.parser.PdfTextExtractor;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfPrintServiceTest {

    private final PdfPrintService service = new PdfPrintService();

    @Test
    void insertsGapsAndStampsTheField() throws Exception {
        FieldPlacement field = new FieldPlacement();
        field.setKey("ApplicationNo1");
        field.setX(72);
        field.setY(700);
        field.setValue("55556666");
        field.setFontSize(12);
        field.setWordspaceCount(1);
        field.setPage(1);

        PrintRequest request = new PrintRequest();
        request.setSymbol("ARUNAYA");
        request.setType("PRINTED_FORM");
        request.setCoordinates(List.of(field));

        byte[] printed = service.print(blankPdf(), request);
        try (PdfDocument document = new PdfDocument(new PdfReader(new ByteArrayInputStream(printed)))) {
            String text = PdfTextExtractor.getTextFromPage(document.getPage(1));
            assertTrue(text.contains("5 5 5 5 6 6 6 6"));
        }
    }

    @Test
    void rejectsAPageOutsideThePdf() {
        FieldPlacement field = new FieldPlacement();
        field.setKey("UPI");
        field.setValue("name@bank");
        field.setPage(3);

        PrintRequest request = new PrintRequest();
        request.setCoordinates(List.of(field));

        PrintException error = assertThrows(PrintException.class, () -> service.print(blankPdf(), request));
        assertEquals("UPI is set to page 3, but this PDF has 1 page(s).", error.getMessage());
    }

    @Test
    void wrapsAtTheBreakWidth() {
        List<String> lines = TextLayout.wrap("Five Thousand", 11f, 0f, 40f, false);
        assertTrue(lines.size() > 1);
        assertEquals("Five", lines.get(0));
    }

    @Test
    void centersEachCharacterInACell() throws Exception {
        FieldPlacement field = new FieldPlacement();
        field.setKey("PAN");
        field.setX(72);
        field.setY(700);
        field.setValue("AB");
        field.setFontSize(12);
        field.setCellWidth(20);
        field.setPage(1);

        PrintRequest request = new PrintRequest();
        request.setCoordinates(List.of(field));

        byte[] printed = service.print(blankPdf(), request);
        try (PdfDocument document = new PdfDocument(new PdfReader(new ByteArrayInputStream(printed)))) {
            String text = PdfTextExtractor.getTextFromPage(document.getPage(1));
            assertTrue(text.contains("A"));
            assertTrue(text.contains("B"));
        }
    }

    @Test
    void printsOneCopyOfTheFormForEachRecord() throws Exception {
        FieldPlacement field = new FieldPlacement();
        field.setKey("PAN");
        field.setX(72);
        field.setY(700);
        field.setValue("FALLBACK");
        field.setPage(1);

        PrintRequest request = new PrintRequest();
        request.setCoordinates(List.of(field));
        request.setRecords(List.of(
                Map.of("PAN", "AAAAA1111A"),
                Map.of("PAN", "BBBBB2222B")
        ));

        byte[] printed = service.print(blankPdf(), request);
        try (PdfDocument document = new PdfDocument(new PdfReader(new ByteArrayInputStream(printed)))) {
            assertEquals(2, document.getNumberOfPages());
            assertTrue(PdfTextExtractor.getTextFromPage(document.getPage(1)).contains("AAAAA1111A"));
            assertTrue(PdfTextExtractor.getTextFromPage(document.getPage(2)).contains("BBBBB2222B"));
        }
    }

    @Test
    void spacesCharactersWithoutChangingTheRawValue() {
        assertEquals("A B", TextSpacing.apply("AB", 1));
        assertEquals("PAN", TextSpacing.apply("PAN", 0));
    }

    private byte[] blankPdf() throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (PdfDocument document = new PdfDocument(new PdfWriter(output))) {
            document.addNewPage(PageSize.A4);
        }
        return output.toByteArray();
    }
}
