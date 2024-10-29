package com.kosafia.gameapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("/")
@Slf4j
public class testController {


    @GetMapping("")
    public void helloworld(){
        log.info("dsfdfsdfsdfsdf");
        System.out.println("hello wolrd");
    }
}
