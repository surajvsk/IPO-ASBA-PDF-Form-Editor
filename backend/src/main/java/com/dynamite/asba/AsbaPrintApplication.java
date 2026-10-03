package com.dynamite.asba;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class AsbaPrintApplication {

    public static void main(String[] args) {
        ensureDataDirectory();
        SpringApplication.run(AsbaPrintApplication.class, args);
    }

    public static void ensureDataDirectory() {
        try {
            Files.createDirectories(Path.of("data"));
        } catch (IOException exception) {
            throw new IllegalStateException("Could not create the database folder.", exception);
        }
    }
}
