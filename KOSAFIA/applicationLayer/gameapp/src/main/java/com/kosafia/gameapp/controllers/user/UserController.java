package com.kosafia.gameapp.controllers.user;

import com.kosafia.gameapp.services.user.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    // 회원가입 엔드포인트
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String username = userData.get("username");
        String password = userData.get("password");

        String result = userService.registerUser(email, username, password);
        if ("회원가입 성공".equals(result)) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
        }
    }

    // 로그인 엔드포인트
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> loginData, HttpSession session) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        if (userService.loginUser(email, password, session)) {
            return ResponseEntity.ok("로그인 성공");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패: 이메일이나 비밀번호가 잘못되었습니다.");
        }
    }

    // 로그아웃 엔드포인트
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        userService.logoutUser(session);
        return ResponseEntity.ok("로그아웃 성공");
    }

    // 프로필 조회 엔드포인트
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(HttpSession session) {
        Map<String, Object> userData = userService.getUserProfile(session);
        if (userData != null) {
            return ResponseEntity.ok(userData);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    // 닉네임 업데이트 엔드포인트
    @PutMapping("/update-username")
    public ResponseEntity<String> updateUsername(@RequestBody Map<String, String> requestData, HttpSession session) {
        String newUsername = requestData.get("username");
        String result = userService.updateUsername(newUsername, session);
        if ("로그인이 필요합니다.".equals(result)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
        return ResponseEntity.ok(result);
    }

    // 비밀번호 업데이트 엔드포인트
    @PutMapping("/update-password")
    public ResponseEntity<String> updatePassword(@RequestBody Map<String, String> requestData, HttpSession session) {
        String currentPassword = requestData.get("currentPassword");
        String newPassword = requestData.get("newPassword");

        String result = userService.updatePassword(currentPassword, newPassword, session);
        if ("로그인이 필요합니다.".equals(result) || "현재 비밀번호가 일치하지 않습니다.".equals(result)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
        return ResponseEntity.ok(result);
    }

    // 회원탈퇴 엔드포인트
    @DeleteMapping("/delete")
    public ResponseEntity<String> deactivateUser(@RequestBody Map<String, String> requestData, HttpSession session) {
        String password = requestData.get("password");
        String result = userService.deactivateUser(password, session);
        if ("로그인이 필요합니다.".equals(result) || "비밀번호가 일치하지 않습니다.".equals(result)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
        return ResponseEntity.ok(result);
    }
}
