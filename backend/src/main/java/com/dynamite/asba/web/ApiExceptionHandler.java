package com.dynamite.asba.web;

import com.dynamite.asba.print.PrintException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(PrintException.class)
    public ResponseEntity<Map<String, String>> handlePrint(PrintException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleMissingResource() {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleUnexpected(Exception exception) {
        log.error("Print request failed", exception);
        return ResponseEntity.internalServerError().body(Map.of("message", "Could not print the PDF."));
    }
}
