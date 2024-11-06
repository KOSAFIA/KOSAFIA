package com.kosafia.gameapp.models.user;

import lombok.Data;
import lombok.ToString;

@ToString
public class UserData {
        private Long userId;
        private String userEmail;
        private String username;
    
        public UserData() {
    
        }
    
        // 생성자
        public UserData(Long userId, String userEmail, String username) {
            this.userId = userId;
            this.userEmail = userEmail;
            this.username = username;
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

}
