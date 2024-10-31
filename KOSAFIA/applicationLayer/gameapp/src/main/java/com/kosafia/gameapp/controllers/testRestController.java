package com.kosafia.gameapp.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.knyTestSet.KnyLoginService;
import com.kosafia.gameapp.knyTestSet.LoginRequest;
import com.kosafia.gameapp.knyTestSet.LoginResponse;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RequiredArgsConstructor
@RestController
public class testRestController {

    private final KnyLoginService knyLoginService;

    @GetMapping("/api/returnwelcome")
    public ResponseEntity<Map<String, String>> getMethodName() {

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("redirect", "/");  // 리다이렉트할 경로
        // return ResponseEntity.ok(response);
        return ResponseEntity.ok(response);
    }
  /**
     * 로그인 요청을 처리하는 엔드포인트
     * @param loginRequest 로그인 요청 정보 (이메일, 비밀번호)
     * @param session HTTP 세션
     * @return 로그인 결과
     */
    
    @PostMapping("/api/knylogin")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        try {
            // 1. 필수 입력값 검증
            if (loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "이메일과 비밀번호 입력해주세요");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // 2. 로그인 처리
            LoginResponse loginResult = knyLoginService.login(loginRequest);

            // 3. 로그인 실패
            if (loginResult == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "이메일 또는 비밀번호가 일치하지 않습니다.");
                return ResponseEntity.badRequest().body(errorResponse);            }

            // 4. 로그인 성공: 세션에 사용자 정보 저장
            session.setAttribute("USER_ID", loginResult.getUserId());
            session.setAttribute("USER_EMAIL", loginResult.getEmail());
            session.setAttribute("USERNAME", loginResult.getUsername());
            
            // 4. 세션 ID를 응답 헤더에 포함
            String sessionId = session.getId();
            
            // 5. 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("userId", loginResult.getUserId());
            response.put("email", loginResult.getEmail());
            response.put("username", loginResult.getUsername());
            response.put("sessionId", sessionId);
            
            // 6. 성공 응답 반환
            return ResponseEntity.ok()
                    .header("X-Session-ID", sessionId)  // 세션 ID를 헤더에 포함
                    .body(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "로그인 처리 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(errorResponse);        
        }
    }

        /**
     * 세션 체크 API
     */
    @GetMapping("/api/check-session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        // 세션에서 사용자 정보 확인
        Integer userId = (Integer) session.getAttribute("USER_ID");
        
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "세션이 만료되었습니다."));
        }

        // 현재 세션 정보 반환
        Map<String, Object> sessionInfo = new HashMap<>();
        sessionInfo.put("userId", userId);
        sessionInfo.put("email", session.getAttribute("USER_EMAIL"));
        sessionInfo.put("username", session.getAttribute("USERNAME"));
        
        return ResponseEntity.ok(sessionInfo);
    }

        /**
     * 로그아웃 처리
     */
    @PostMapping("/api/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();  // 세션 무효화
        return ResponseEntity.ok()
                .body(Map.of("message", "로그아웃 되었습니다."));
    }
}