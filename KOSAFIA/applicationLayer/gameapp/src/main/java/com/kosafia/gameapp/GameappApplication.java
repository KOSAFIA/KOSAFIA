package com.kosafia.gameapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.kosafia.gameapp")
public class GameappApplication {

	public static void main(String[] args) {
		SpringApplication.run(GameappApplication.class, args);
	}

}
