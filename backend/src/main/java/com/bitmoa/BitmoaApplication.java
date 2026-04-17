package com.bitmoa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BitmoaApplication {

    public static void main(String[] args) {
        SpringApplication.run(BitmoaApplication.class, args);
    }
}
