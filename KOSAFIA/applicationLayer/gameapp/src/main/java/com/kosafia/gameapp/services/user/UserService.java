package com.kosafia.gameapp.services.user;

import com.kosafia.gameapp.mapper.user.UserMapper;
import com.kosafia.gameapp.models.user.User;
import com.kosafia.gameapp.models.user.UserData;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service // 이 클래스가 스프링의 서비스 계층임을 나타내며, 비즈니스 로직을 처리
public class UserService {

    @Autowired // UserMapper는 DB와의 상호작용을 담당
    private UserMapper userMapper;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(); // 비밀번호 암호화를 위한 BCryptPasswordEncoder
                                                                                 // 생성

    // 회원가입 메서드
    public String registerUser(String email, String username, String password) {
        User existingUser = userMapper.findByEmail(email); // 이메일로 사용자 조회
        if (existingUser != null) { // 이미 이메일이 사용 중이라면
            return "이미 사용 중인 이메일입니다."; // 에러 메시지 반환
        }

        User newUser = new User(); // 새로운 User 객체 생성 및 초기화
        newUser.setUserEmail(email); // 이메일 설정
        newUser.setUsername(username);// 닉네임 설정
        newUser.setPassword(passwordEncoder.encode(password)); // 비밀번호 암호화 후 설정
        newUser.setStatus(1); // 상태 1로 설정 (활성 상태)
        newUser.setCreatedAt(LocalDateTime.now()); // 생성일 현재 시간으로 설정

        userMapper.insertUser(newUser); // DB에 사용자 저장
        return "회원가입 성공"; // 성공 메시지 반환
    }

    // 로그인 메서드
    public boolean loginUser(String email, String password, HttpSession session) {
        User user = userMapper.findByEmail(email); // 이메일로 사용자 조회
        // 비밀번호 일치 확인 및 활성 사용자 여부 체크
        if (user != null && passwordEncoder.matches(password, user.getPassword()) && user.getStatus() == 1) {
            session.setAttribute("user", user); // 세션에 사용자 정보 저장
            return true;// 로그인 성공
        }
        return false;// 로그인 실패
    }

    // 로그아웃 메서드
    public void logoutUser(HttpSession session) {
        session.invalidate(); // 세션 무효화하여 로그아웃 처리
    }

    // 프로필 조회 메서드
    public Map<String, Object> getUserProfile(HttpSession session) {
        User user = (User) session.getAttribute("user"); // 세션에서 사용자 정보 가져오기
        if (user == null) // 사용자 정보가 없을 경우 처리
            return null;

        // 사용자 정보를 Map에 담아 반환
        Map<String, Object> userData = new HashMap<>();// 사용자 정보를 Map에 담기
        userData.put("user_email", user.getUserEmail());
        userData.put("username", user.getUsername());
        return userData;
    }

    // 닉네임 업데이트 메서드
    public String updateUsername(String newUsername, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return "로그인이 필요합니다.";// 로그인 상태가 아니면 메시지 반환

        user.setUsername(newUsername); // 닉네임 업데이트
        userMapper.updateUser(user);// DB 업데이트
        return "닉네임이 성공적으로 변경되었습니다.";
    }

    // 비밀번호 업데이트 메서드
    public String updatePassword(String currentPassword, String newPassword, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return "로그인이 필요합니다.";

        // 현재 비밀번호와 입력된 비밀번호가 일치하는지 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return "현재 비밀번호가 일치하지 않습니다.";
        }

        user.setPassword(passwordEncoder.encode(newPassword));// 새로운 비밀번호 암호화 후 설정
        userMapper.updateUser(user);// DB에 업데이트
        return "비밀번호가 성공적으로 변경되었습니다.";
    }

    // 회원 탈퇴 메서드
    public String deactivateUser(String password, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return "로그인이 필요합니다."; // 로그인 상태가 아니면 메시지 반환

        // 비밀번호가 일치하면 탈퇴 처리
        if (passwordEncoder.matches(password, user.getPassword())) {
            userMapper.deactivateUser(user.getUserId()); // DB에서 사용자 상태 변경
            session.invalidate(); // 세션 무효화
            return "회원탈퇴가 성공적으로 완료되었습니다.";
        } else {
            return "비밀번호가 일치하지 않습니다.";
        }
    }

    // 특정 User를 UserData 형식으로 가져오는 메서드 // 로그인한 user정보 필요한 사람 이거 쓰세요~~~
    public UserData getUserData(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return null; // 사용자 정보가 없으면 null 반환
        }
        // UserData 객체로 변환하여 반환
        return new UserData(user.getUserId(), user.getUserEmail(), user.getUsername());
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ///
    // OAuth2 Google 로그인 사용자 정보를 처리하는 메서드
    public String processOAuth2User(Map<String, Object> userAttributes, HttpSession session) {
        String email = (String) userAttributes.get("email"); // Google에서 제공한 이메일
        String providerId = (String) userAttributes.get("sub"); // Google의 unique ID
        String provider = "google"; // provider를 "google"로 설정

        // providerId로 기존 사용자 찾기
        User user = userMapper.findByProviderId(providerId);
        if (user == null) {
            // 신규 사용자 등록 (Google 계정으로 처음 로그인 시)
            user = new User();
            user.setUserEmail(email);
            user.setUsername((String) userAttributes.get("name")); // Google 사용자 이름
            user.setProvider(provider); // 로그인 제공자를 "google"로 설정
            user.setProviderId(providerId); // Google unique ID 설정
            user.setPassword(""); // OAuth 사용자의 경우 비밀번호를 빈 문자열로 설정
            user.setStatus(1); // 상태를 활성화로 설정
            user.setCreatedAt(LocalDateTime.now()); // 계정 생성일 설정
            userMapper.insertUser(user); // DB에 사용자 정보 저장
        }

        // 세션에 사용자 정보 저장
        session.setAttribute("user", user);
        return "OAuth2 로그인 성공";
    }

    public String deactivateOAuth2User(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return "로그인이 필요합니다."; // 로그인 상태가 아니면 메시지 반환

        // OAuth 사용자의 탈퇴 처리 (provider가 존재하는 경우)
        if (user.getProvider() != null && user.getProvider().equals("google")) {
            userMapper.deactivateUser(user.getUserId()); // STATUS를 0으로 업데이트
            session.invalidate(); // 세션 무효화
            return "회원탈퇴가 성공적으로 완료되었습니다.";
        } else {
            return "OAuth2 사용자가 아닙니다."; // OAuth2 사용자가 아닌 경우 처리
        }
    }

}
