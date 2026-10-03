package com.dynamite.asba;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

public class ServletInitializer extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        AsbaPrintApplication.ensureDataDirectory();
        return application.sources(AsbaPrintApplication.class);
    }
}
