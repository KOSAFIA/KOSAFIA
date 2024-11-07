package com.kosafia.gameapp.models.user;

import lombok.Data;
import java.time.LocalDateTime;

// @Data 애너테이션을 사용하면 Lombok 라이브러리가 자동으로 getter, setter, toString, equals, hashCode 메서드를 생성
@Data
public class User {
    private Long userId;
    private String userEmail; //사용자 이메일
    private String username; //사용자 닉네임
    private String password;  // 사용자 비밀번호
    private int status;  // 사용자 계정 상태를 나타내는 필드 (1: 활성 상태, 0: 탈퇴 상태)
    private LocalDateTime createdAt; // 계정 생성일

    // 로그인 제공자(예: "google")를 저장하는 필드, 일반 로그인인 경우 null이 될 수 있음
    private String provider;

    // 로그인 제공자가 제공한 유저의 고유 ID를 저장하는 필드
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
}
