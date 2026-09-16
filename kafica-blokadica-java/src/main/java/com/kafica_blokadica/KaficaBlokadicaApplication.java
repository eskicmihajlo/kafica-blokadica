package com.kafica_blokadica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KaficaBlokadicaApplication {

	public static void main(String[] args) {
		SpringApplication.run(KaficaBlokadicaApplication.class, args);
	}

}
