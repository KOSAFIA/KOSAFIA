package com.kosafia.gameapp.models.user;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Long userId;
    private String userEmail;
    private String username;
    private String password;
    private int status; // 1: 활성, 0: 탈퇴
    private LocalDateTime createdAt; // 계정 생성일

    // provider : google이 들어감
    private String provider;

    // providerId : 구굴 로그인 한 유저의 고유 ID가 들어감
    private String providerId;

    // 기본 생성자 추가 (MyBatis에서 필요)
    public User() {
    }

    // 매개변수가 있는 생성자
    public User(Long userId, String userEmail, String username, String password, int status) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.username = username;
        this.password = password;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public UserData toUserData() {
        return new UserData(this.userId, this.userEmail, this.username);
    }
}
