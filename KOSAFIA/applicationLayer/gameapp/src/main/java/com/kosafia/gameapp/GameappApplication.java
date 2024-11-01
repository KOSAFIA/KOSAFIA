package com.kosafia.gameapp;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@MapperScan("com.kosafia.gameapp.mapper") // UserMapper가 위치한 패키지
@ComponentScan(basePackages = "com.kosafia.gameapp")
public class GameappApplication {

	public static void main(String[] args) {
		SpringApplication.run(GameappApplication.class, args);
	}

}
