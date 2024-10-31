package com.kosafia.gameapp.repositories.user;

import com.kosafia.gameapp.models.user.User;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;

@Repository
public class UserRepository {
    private final Map<String, User> users = new HashMap<>();

    public UserRepository() {

        // 밑에는 테스트 계정
        // 기본 사용자 추가 (실제 프로젝트에서는 DB로부터 사용자 정보를 불러옴)
        users.put("test@example.com", new User(1L, "test@example.com", "testUser", "password123", 1));
    }

    public User findByEmail(String email) {
        return users.get(email);
    }
}