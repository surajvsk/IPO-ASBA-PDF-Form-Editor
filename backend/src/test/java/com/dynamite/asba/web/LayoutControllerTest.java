package com.dynamite.asba.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LayoutControllerTest {

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> "jdbc:sqlite:target/test-layouts.db");
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void savesAndLoadsALayout() throws Exception {
        String body = """
                {
                  "symbol": "arunaya",
                  "type": "PRINTED_FORM",
                  "coordinates": [
                    {"id": "field-1", "key": "PAN", "value": "AYCPV8888G", "x": 206, "y": 740, "isActive": true}
                  ]
                }
                """;

        mockMvc.perform(post("/api/layouts").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("ARUNAYA"))
                .andExpect(jsonPath("$.count").value(1));

        mockMvc.perform(get("/api/layouts").param("symbol", "ARUNAYA").param("type", "PRINTED_FORM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coordinates[0].key").value("PAN"))
                .andExpect(jsonPath("$.coordinates[0].value").value("AYCPV8888G"));
    }

    @Test
    void missingLayoutReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/layouts").param("symbol", "NOSUCH").param("type", "BLANK_FORM"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No saved layout for this symbol and form type."));
    }
}
