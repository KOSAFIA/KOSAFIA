package com.kosafia.gameapp.controllers.user;

import com.kosafia.gameapp.models.user.User;
import com.kosafia.gameapp.mapper.user.UserMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    // // 로그인 엔드포인트
    // @PostMapping("/login")
    // public ResponseEntity<String> login(@RequestBody Map<String, String>
    // loginData, HttpSession session) {
    // String email = loginData.get("email");
    // String password = loginData.get("password");

    // // MySQL에서 사용자 조회
    // User user = userMapper.findByEmail(email);

    // // 사용자 인증
    // if (user != null && user.getPassword().equals(password) && user.getStatus()
    // == 1) {
    // session.setAttribute("user", user); // 세션에 사용자 정보 저장
    // return ResponseEntity.ok("로그인 성공");
    // } else {
    // // 로그인 실패 시 세션을 비워둠
    // session.invalidate(); // 세션 초기화
    // return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패: 이메일이나
    // 비밀번호가 잘못되었습니다.");
    // }
    // }

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
}
