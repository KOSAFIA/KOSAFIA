package com.kosafia.gameapp.models.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;


import java.time.LocalDateTime;

@Data
@Builder @AllArgsConstructor //김남영 수정. 유저세션 레파지토리에 유저를 빌더 함수로 추가할때 필요--2024/11/05
public class User {
    private Long userId;
    private String userEmail;
    private String username;
    private String password;
    private int status; // 1: 활성, 0: 탈퇴
    private LocalDateTime createdAt; // 계정 생성일

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
}
