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
}
