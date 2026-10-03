package com.dynamite.asba.layout;

import com.dynamite.asba.print.PrintException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class LayoutStore {

    private static final TypeReference<List<Map<String, Object>>> FIELD_LIST = new TypeReference<>() {
    };

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public LayoutStore(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public void save(String symbol, String formType, List<Map<String, Object>> coordinates) {
        String json;
        try {
            json = objectMapper.writeValueAsString(coordinates);
        } catch (Exception exception) {
            throw new PrintException("The layout could not be saved.");
        }
        jdbcTemplate.update(
                """
                INSERT INTO layout (symbol, form_type, fields_json, updated_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(symbol, form_type) DO UPDATE SET
                    fields_json = excluded.fields_json,
                    updated_at = excluded.updated_at
                """,
                symbol,
                formType,
                json,
                Instant.now().toString()
        );
    }

    public Optional<List<Map<String, Object>>> find(String symbol, String formType) {
        List<String> rows = jdbcTemplate.query(
                "SELECT fields_json FROM layout WHERE symbol = ? AND form_type = ?",
                (resultSet, row) -> resultSet.getString("fields_json"),
                symbol,
                formType
        );
        if (rows.isEmpty()) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(rows.get(0), FIELD_LIST));
        } catch (Exception exception) {
            throw new PrintException("The saved layout could not be read.");
        }
    }
}
