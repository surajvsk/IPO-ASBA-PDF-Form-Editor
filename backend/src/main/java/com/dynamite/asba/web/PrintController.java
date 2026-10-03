package com.dynamite.asba.web;

import com.dynamite.asba.print.PdfPrintService;
import com.dynamite.asba.print.PrintException;
import com.dynamite.asba.print.PrintRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
public class PrintController {

    private final PdfPrintService pdfPrintService;
    private final ObjectMapper objectMapper;

    public PrintController(PdfPrintService pdfPrintService, ObjectMapper objectMapper) {
        this.pdfPrintService = pdfPrintService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @PostMapping(value = "/api/print", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> print(
            @RequestParam("pdf") MultipartFile pdf,
            @RequestParam("data") String data) throws Exception {
        PrintRequest request;
        try {
            request = objectMapper.readValue(data, PrintRequest.class);
        } catch (Exception exception) {
            throw new PrintException("The print data is not valid JSON.");
        }
        byte[] printed = pdfPrintService.print(pdf.getBytes(), request);
        String filename = fileName(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(printed);
    }

    private String fileName(PrintRequest request) {
        String symbol = sanitize(request.getSymbol());
        String type = sanitize(request.getType());
        if (symbol.isEmpty()) {
            symbol = "asba";
        }
        if (type.isEmpty()) {
            type = "form";
        }
        return symbol + "-" + type + ".pdf";
    }

    private String sanitize(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().replaceAll("[^A-Za-z0-9_-]", "_");
    }
}
