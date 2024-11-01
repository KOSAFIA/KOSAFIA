package com.kosafia.gameapp.controllers.user;

import com.kosafia.gameapp.models.user.User;
import com.kosafia.gameapp.mapper.user.UserMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    // 회원가입 엔드포인트
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String username = userData.get("username");
        String password = userData.get("password");

        // 이메일 중복 검사
        User existingUser = userMapper.findByEmail(email);
        if (existingUser != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 사용 중인 이메일입니다.");
        }

        // 새로운 사용자 객체 생성
        User newUser = new User();
        newUser.setUserEmail(email);
        newUser.setUsername(username);
        newUser.setPassword(password); // 실제 환경에서는 비밀번호 암호화 필요
        newUser.setStatus(1); // 활성 상태
        newUser.setCreatedAt(LocalDateTime.now());

        // 사용자 정보를 데이터베이스에 저장
        userMapper.insertUser(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공");
    }

    // 로그인 엔드포인트
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> loginData, HttpServletRequest request) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        // MySQL에서 사용자 조회
        User user = userMapper.findByEmail(email);

        // 사용자 인증
        if (user != null && user.getPassword().equals(password) && user.getStatus() == 1) {
            HttpSession session = request.getSession(true); // 로그인 성공 시에만 세션 생성
            session.setAttribute("user", user);
            return ResponseEntity.ok("로그인 성공");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패: 이메일이나 비밀번호가 잘못되었습니다.");
        }
    }

    // 로그아웃 엔드포인트
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate(); // 세션 종료
        return ResponseEntity.ok("로그아웃 성공");
    }

    // 세션 상태 확인 (테스트용)
    @GetMapping("/session")
    public ResponseEntity<String> checkSession(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            return ResponseEntity.ok("로그인된 사용자: " + user.getUsername());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 필요");
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 프로필 조회 엔드포인트
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(HttpSession session) {
        User user = (User) session.getAttribute("user");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Map<String, Object> userData = new HashMap<>();
        userData.put("user_email", user.getUserEmail());
        userData.put("username", user.getUsername());

        return ResponseEntity.ok(userData);
    }

    // 닉네임 업데이트 엔드포인트
    @PutMapping("/update-username")
    public ResponseEntity<String> updateUsername(@RequestBody Map<String, String> requestData, HttpSession session) {
        User user = (User) session.getAttribute("user");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        String newUsername = requestData.get("username");
        user.setUsername(newUsername);
        userMapper.updateUser(user); // UserMapper에 updateUser 메서드 필요

        return ResponseEntity.ok("닉네임이 성공적으로 변경되었습니다.");
    }

    // 비밀번호 업데이트 엔드포인트
    @PutMapping("/update-password")
    public ResponseEntity<String> updatePassword(@RequestBody Map<String, String> requestData, HttpSession session) {
        User user = (User) session.getAttribute("user");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        String currentPassword = requestData.get("currentPassword");
        String newPassword = requestData.get("newPassword");

        // 현재 비밀번호 확인
        if (!user.getPassword().equals(currentPassword)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("현재 비밀번호가 일치하지 않습니다.");
        }

        user.setPassword(newPassword);
        userMapper.updateUser(user); // UserMapper에 updateUser 메서드 필요

        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }
}
