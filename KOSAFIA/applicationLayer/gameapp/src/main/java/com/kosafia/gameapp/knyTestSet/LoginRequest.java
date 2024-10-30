package com.kosafia.gameapp.knyTestSet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 클라이언트로부터 받는 로그인 요청 데이터를 담는 DTO
 * 프론트엔드에서 전송하는 JSON 데이터와 매핑됨
 */
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class LoginRequest {
    private String email;    // 사용자가 입력한 이메일
    private String password; // 사용자가 입력한 비밀번호
}

/* 실제 JSON 형태는 다음과 같습니다:
{
    "email": "user@example.com",
    "password": "userpassword123"
}
*/