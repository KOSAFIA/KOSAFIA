package com.kosafia.gameapp.controller;

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
        return "index";
    }

    @GetMapping("/react")
    public String reactHello() {
        return "forward:/index.html";
    }
    
}
