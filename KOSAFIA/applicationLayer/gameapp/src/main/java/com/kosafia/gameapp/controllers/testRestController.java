package com.kosafia.gameapp.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.apache.catalina.connector.Response;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api")
public class testRestController {
    @GetMapping("/returnwelcome")
    public ResponseEntity<Map<String, String>> getMethodName() {

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("redirect", "/");  // 리다이렉트할 경로
        // return ResponseEntity.ok(response);
        return ResponseEntity.ok(response);
    }
    
}
