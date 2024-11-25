package com.kosafia.gameapp.controllers.user;

import com.kosafia.gameapp.models.user.User;
import com.kosafia.gameapp.models.user.UserData;
import com.kosafia.gameapp.services.user.UserService; // UserService 클래스 임포트
import jakarta.servlet.http.HttpSession; // HttpSession 클래스를 통해 세션 관리
import org.springframework.beans.factory.annotation.Autowired; // @Autowired 애너테이션 임포트 (의존성 주입)
import org.springframework.http.HttpStatus; // HTTP 상태 코드 사용
import org.springframework.http.ResponseEntity; // HTTP 응답 객체 생성
import org.springframework.web.bind.annotation.*; // 웹 요청 처리를 위한 애너테이션
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map; // JSON 형태의 데이터 처리를 위한 Map 사용

@RestController // 이 클래스가 RESTful 웹 서비스 컨트롤러임을 나타냄
@RequestMapping("/api/user") // 이 컨트롤러의 기본 경로 설정
public class UserController {

    @Autowired // UserService를 자동 주입받아 회원 관련 서비스 로직에 접근 가능
    private UserService userService;

    // 회원가입 엔드포인트
    @PostMapping("/register") // "/api/user/register" 경로로 POST 요청이 올 때 실행
    public ResponseEntity<String> register(@RequestBody Map<String, String> userData) {
        // 클라이언트에서 전송된 JSON 데이터를 Map으로 받음
        String email = userData.get("email"); // userData에서 "email" 키의 값을 가져옴
        String username = userData.get("username"); // userData에서 "username" 키의 값을 가져옴
        String password = userData.get("password"); // userData에서 "password" 키의 값을 가져옴

        // 회원가입 로직 처리 - userService의 registerUser 메서드 호출
        String result = userService.registerUser(email, username, password);

        // 회원가입 성공 여부에 따라 응답 처리
        if ("회원가입 성공".equals(result)) { // 회원가입 성공 시
            // 201 Created 상태 코드와 함께 result 메시지를 응답 본문에 포함하여 반환
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } else { // 회원가입 실패 시
            // 409 Conflict 상태 코드와 함께 result 메시지를 응답 본문에 포함하여 반환
            return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
        }
    }

    // 이메일 중복 검사 엔드포인트
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean isAvailable = userService.isEmailAvailable(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", isAvailable);
        return ResponseEntity.ok(response);
    }

    // 닉네임 중복 검사 엔드포인트
    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestParam String username) {
        boolean isAvailable = userService.isUsernameAvailable(username);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", isAvailable);
        return ResponseEntity.ok(response);
    }

    // 로그인 엔드포인트
    @PostMapping("/login") // "/api/user/login" 경로로 POST 요청이 올 때 실행
    // 김남영 수정: 반환타입 String -> ?
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData, HttpSession session) {
        // 클라이언트에서 전송된 로그인 데이터를 Map으로 받음
        String email = loginData.get("email"); // loginData에서 "email" 키의 값을 가져옴
        String password = loginData.get("password"); // loginData에서 "password" 키의 값을 가져옴

        // loginUser 메서드 호출하여 로그인 처리 결과를 변수에 저장
        Map<String, Object> loginResponse = userService.loginUser(email, password, session);
        // 로그인 로직 처리 - userService의 loginUser 메서드 호출
        // 로그인 성공 여부 확인 (status가 1이면 로그인 성공)
        if ((int) loginResponse.get("status") == 1) {
            // 로그인 성공 시, 세션에 사용자 정보가 저장되어 있으므로 UserData를 반환
            UserData userData = userService.getUserData(session);
            return ResponseEntity.ok(userData); // 로그인 성공 시 UserData 반환
        } else {
            // 로그인 실패 시 (status가 0)
            String errorMessage = (String) loginResponse.get("message"); // 실패 메시지
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorMessage); // 실패 메시지와 함께 401 상태 반환
        }
    }

    // 로그아웃 엔드포인트
    @PostMapping("/logout") // "/api/user/logout" 경로로 POST 요청이 올 때 실행
    public ResponseEntity<String> logout(HttpSession session) {
        try {
            // 세션 무효화
            userService.logoutUser(session);
            return ResponseEntity.ok("로그아웃 성공");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("로그아웃 중 오류가 발생했습니다.");
        }
    }

    @PostMapping("/api/user/google-logout")
    public ResponseEntity<Void> googleLogout() {
        RestTemplate restTemplate = new RestTemplate();
        String googleLogoutUrl = "https://accounts.google.com/logout";
        try {
            restTemplate.getForObject(googleLogoutUrl, String.class);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 프로필 조회 엔드포인트
    @GetMapping("/profile") // "/api/user/profile" 경로로 GET 요청이 올 때 실행
    public ResponseEntity<Map<String, Object>> getProfile(HttpSession session) {
        // 세션에 저장된 사용자 정보를 가져옴
        Map<String, Object> userData = userService.getUserProfile(session);
        if (userData != null) { // 사용자 정보가 존재하면
            // 200 OK 상태 코드와 함께 사용자 정보를 응답 본문에 포함하여 반환
            return ResponseEntity.ok(userData);
        } else { // 사용자 정보가 없으면 (로그인이 필요함)
            // 401 Unauthorized 상태 코드와 함께 null을 반환
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    // 닉네임 업데이트 엔드포인트
    @PutMapping("/update-username") // "/api/user/update-username" 경로로 PUT 요청이 올 때 실행
    public ResponseEntity<String> updateUsername(@RequestBody Map<String, String> requestData, HttpSession session) {
        // 클라이언트에서 전송된 데이터에서 새 닉네임 추출
        String newUsername = requestData.get("username");

        // 닉네임 업데이트 로직 처리 - userService의 updateUsername 메서드 호출
        String result = userService.updateUsername(newUsername, session);

        if ("로그인이 필요합니다.".equals(result)) { // 로그인되지 않은 경우
            // 401 Unauthorized 상태 코드와 함께 오류 메시지 반환
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }

        // 200 OK 상태 코드와 함께 성공 메시지 반환
        return ResponseEntity.ok(result);
    }

    // 비밀번호 업데이트 엔드포인트
    @PutMapping("/update-password") // "/api/user/update-password" 경로로 PUT 요청이 올 때 실행
    public ResponseEntity<String> updatePassword(@RequestBody Map<String, String> requestData, HttpSession session) {
        // 요청 데이터에서 현재 비밀번호와 새 비밀번호를 가져옴
        String currentPassword = requestData.get("currentPassword");
        String newPassword = requestData.get("newPassword");

        // 세션에서 사용자 정보 가져오기
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        // OAuth 사용자 여부 확인
        if (user.getProvider() != null && !user.getProvider().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OAuth 사용자 계정은 비밀번호를 변경할 수 없습니다.");
        }

        // 비밀번호 업데이트 로직 처리 - userService의 updatePassword 메서드 호출
        String result = userService.updatePassword(currentPassword, newPassword, session);

        if ("현재 비밀번호가 일치하지 않습니다.".equals(result)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }

        // 200 OK 상태 코드와 함께 성공 메시지 반환
        return ResponseEntity.ok(result);
    }

    // 회원탈퇴 엔드포인트
    @DeleteMapping("/delete")
    public ResponseEntity<String> deactivateUser(@RequestBody(required = false) Map<String, String> requestData,
            HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        // OAuth 사용자인 경우 비밀번호 확인 없이 탈퇴 처리
        if (user.getProvider() != null && !user.getProvider().isEmpty()) {
            String result = userService.deactivateOAuth2User(session);
            return ResponseEntity.ok(result);
        }

        // 일반 사용자 탈퇴 처리
        if (requestData == null || !requestData.containsKey("password")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("비밀번호가 필요합니다.");
        }

        String password = requestData.get("password");
        String result = userService.deactivateUser(password, session);

        if ("비밀번호가 일치하지 않습니다.".equals(result)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }

        return ResponseEntity.ok(result);
    }

    // 김남영 추가 담백하게 UserData 반환
    @GetMapping("/response-userData") // "/api/user/response-userData" 경로로 GET 요청이 올 때 실행
    public ResponseEntity<UserData> getUserData(HttpSession session) {
        // 세션에 저장된 유저로 유저 데이타 변환해서 호출출
        UserData userData = userService.getUserData(session);
        if (userData != null) { // 사용자 정보가 존재하면
            // 200 OK 상태 코드와 함께 사용자 정보를 응답 본문에 포함하여 반환
            return ResponseEntity.ok(userData);
        } else { // 사용자 정보가 없으면 (로그인이 필요함)
            // 401 Unauthorized 상태 코드와 함께 null을 반환
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    //////////////////////////////////////////////////////////////////////

    // // oauth 사용자 회원탈퇴 엔드포인트
    // @DeleteMapping("/delete-oauth")
    // public ResponseEntity<String> deleteOAuthUserAccount(HttpSession session) {
    // // 요청 로그 추가
    // System.out.println("OAuth 회원탈퇴 요청이 수신되었습니다.");

    // // 회원탈퇴 처리 로직
    // try {
    // String result = userService.deactivateOAuth2User(session);
    // if ("회원탈퇴가 성공적으로 완료되었습니다.".equals(result)) {
    // return ResponseEntity.ok(result);
    // } else {
    // return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    // }
    // } catch (Exception e) {
    // System.out.println("회원탈퇴 중 오류 발생: " + e.getMessage());
    // return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원탈퇴
    // 실패");
    // }
    // }
}
