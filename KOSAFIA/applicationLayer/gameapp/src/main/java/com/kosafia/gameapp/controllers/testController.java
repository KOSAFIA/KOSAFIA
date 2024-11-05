package com.kosafia.gameapp.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@Slf4j
public class testController {

    @GetMapping("/")
    public String helloworld(){
        log.info("dsfdfsdfsdfsdf");
        System.out.println("hello wolrd");
        return "forward:/index.html";
    }

    @GetMapping({"/react", "/react/**"})
    public String reactHello() {
        log.info("리액트 페이지로 들어가");
        return "forward:/index.html";
    }
    
    //지연 lobby
    @GetMapping("/lobby")
    public String lobby() {
        return "forward:/index.html"; // React의 빌드된 index.html을 반환
    }
}
