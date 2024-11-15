package com.kosafia.gameapp.models.user;

import lombok.Data;
import lombok.ToString;

@ToString
@Data
public class UserData {
    private Long userId;
    private String userEmail; // 사용자 이메일
    private String username; // 사용자 닉네임
    private String provider; // OAuth 제공자 (Google)

    public UserData() {

    }

    // 생성자
    public UserData(Long userId, String userEmail, String username) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.username = username;
    }

    public UserData(Long userId, String userEmail, String username, String provider) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.username = username;
        this.provider = provider;
    }

    // Getter 메서드
    public Long getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getUsername() {
        return username;
    }

    public String getProvider() { // OAuth 사용자 여부를 확인할 수 있도록 provider 필드를 추가
        return provider;
    }

}
