package com.kosafia.gameapp.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestParam;

@Controller // 이 클래스를 Spring MVC 컨트롤러로 지정
@Slf4j // Lombok의 로그 라이브러리로, log 변수를 통해 쉽게 로그를 기록할 수 있음
public class testController {

    @GetMapping("/")
    public String helloworld() {
        log.info("dsfdfsdfsdfsdf");
        System.out.println("hello wolrd");
        return "forward:/index.html";  // 요청을 React의 index.html로 전달하여 클라이언트에 반환
    }

    @GetMapping({ "/react", "/react/**" })  // 여러 경로를 설정할 때 배열 형태로 사용 가능
    public String reactHello() {
        log.info("리액트 페이지로 들어가");
        return "forward:/index.html";
    }

    // 지연 lobby
    @GetMapping("/TestLobby")
    public String TestLobby() {
        return "forward:/index.html"; // React의 빌드된 index.html을 반환
    }

    @GetMapping("/LoginOk")
    public String loginOk() {
        return "forward:/index.html"; // LoginOk 경로를 React의 index.html로 전달
    }
}
