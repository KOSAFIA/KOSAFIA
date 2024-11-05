package com.kosafia.gameapp.services.user;

import com.kosafia.gameapp.mapper.user.UserMapper;
import com.kosafia.gameapp.models.user.User;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    //=======김남영 터치 책임은 김남영이============
    public User getUserFromSession(HttpSession session){
        User user = (User) session.getAttribute("user");
        if (user == null)
            return null;

        return user;
    }
    //=======김남영 터치 책임은 김남영이============

    // 회원가입 메서드
    public String registerUser(String email, String username, String password) {
        User existingUser = userMapper.findByEmail(email);
        if (existingUser != null) {
            return "이미 사용 중인 이메일입니다.";
        }

        User newUser = new User();
        newUser.setUserEmail(email);
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setStatus(1);
        newUser.setCreatedAt(LocalDateTime.now());

        userMapper.insertUser(newUser);
        return "회원가입 성공";
    }

    // 로그인 메서드
    public boolean loginUser(String email, String password, HttpSession session) {
        User user = userMapper.findByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword()) && user.getStatus() == 1) {
            session.setAttribute("user", user);
            return true;
        }
        return false;
    }

    // 로그아웃 메서드
    public void logoutUser(HttpSession session) {
        session.invalidate();
    }

    // 프로필 조회 메서드
    public Map<String, Object> getUserProfile(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return null;

        Map<String, Object> userData = new HashMap<>();
        userData.put("user_email", user.getUserEmail());
        userData.put("username", user.getUsername());
        return userData;
    }

    // 닉네임 업데이트 메서드
    public String updateUsername(String newUsername, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return "로그인이 필요합니다.";

        user.setUsername(newUsername);
        userMapper.updateUser(user);
        return "닉네임이 성공적으로 변경되었습니다.";
    }

    // 비밀번호 업데이트 메서드
    public String updatePassword(String currentPassword, String newPassword, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return "로그인이 필요합니다.";

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return "현재 비밀번호가 일치하지 않습니다.";
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.updateUser(user);
        return "비밀번호가 성공적으로 변경되었습니다.";
    }

    // 회원 탈퇴 메서드
    public String deactivateUser(String password, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return "로그인이 필요합니다.";

        if (passwordEncoder.matches(password, user.getPassword())) {
            userMapper.deactivateUser(user.getUserId());
            session.invalidate();
            return "회원탈퇴가 성공적으로 완료되었습니다.";
        } else {
            return "비밀번호가 일치하지 않습니다.";
        }
    }
}
