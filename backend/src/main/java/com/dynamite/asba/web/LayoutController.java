package com.dynamite.asba.web;

import com.dynamite.asba.layout.LayoutStore;
import com.dynamite.asba.print.PrintException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
public class LayoutController {

    private static final int MAX_FIELDS = 500;
    private static final Set<String> FORM_TYPES = Set.of("PRINTED_FORM", "BLANK_FORM");

    private final LayoutStore layoutStore;

    public LayoutController(LayoutStore layoutStore) {
        this.layoutStore = layoutStore;
    }

    @PostMapping("/api/layouts")
    public Map<String, Object> save(@RequestBody Map<String, Object> body) {
        if (body == null) {
            throw new PrintException("The layout data is not valid.");
        }
        String symbol = normalizeSymbol(body.get("symbol"));
        String formType = normalizeType(body.get("type"));
        List<Map<String, Object>> coordinates = coordinates(body.get("coordinates"));
        layoutStore.save(symbol, formType, coordinates);
        return Map.of("symbol", symbol, "type", formType, "count", coordinates.size());
    }

    @GetMapping("/api/layouts")
    public ResponseEntity<?> load(@RequestParam("symbol") String symbol, @RequestParam("type") String formType) {
        String normalizedSymbol = normalizeSymbol(symbol);
        String normalizedType = normalizeType(formType);
        return layoutStore.find(normalizedSymbol, normalizedType)
                .<ResponseEntity<?>>map(coordinates -> ResponseEntity.ok(Map.of(
                        "symbol", normalizedSymbol,
                        "type", normalizedType,
                        "coordinates", coordinates
                )))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of(
                        "message", "No saved layout for this symbol and form type."
                )));
    }

    private String normalizeSymbol(Object value) {
        String symbol = value == null ? "" : String.valueOf(value).trim().toUpperCase();
        if (symbol.isEmpty() || !symbol.matches("[A-Z0-9][A-Z0-9 ._-]{0,39}")) {
            throw new PrintException("Enter an IPO symbol made of letters and numbers.");
        }
        return symbol;
    }

    private String normalizeType(Object value) {
        String formType = value == null ? "" : String.valueOf(value).trim();
        if (!FORM_TYPES.contains(formType)) {
            throw new PrintException("Choose Printed form or Blank form.");
        }
        return formType;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> coordinates(Object value) {
        if (!(value instanceof List<?> list)) {
            throw new PrintException("The layout data is not valid.");
        }
        if (list.size() > MAX_FIELDS) {
            throw new PrintException("A layout can contain at most 500 fields.");
        }
        for (Object item : list) {
            if (!(item instanceof Map<?, ?>)) {
                throw new PrintException("The layout data is not valid.");
            }
        }
        return (List<Map<String, Object>>) value;
    }
}
