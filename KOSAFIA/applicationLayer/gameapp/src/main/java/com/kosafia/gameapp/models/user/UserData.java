package com.kosafia.gameapp.models.user;

import lombok.Data;
import lombok.ToString;

@ToString
@Data
public class UserData {
        private Long userId;
        private String userEmail; //사용자 이메일
        private String username; //사용자 닉네임
    
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
