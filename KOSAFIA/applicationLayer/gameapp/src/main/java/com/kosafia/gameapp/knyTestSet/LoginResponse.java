package com.kosafia.gameapp.knytestset;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 로그인 성공 시 클라이언트에게 전송할 데이터를 담는 DTO
 * 서버에서 클라이언트로 전송되는 JSON 데이터와 매핑됨
 */
@Getter
@Builder // Builder 패턴을 사용하여 객체 생성
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Integer userId;   // DB에서 조회된 사용자 ID
    private String email;     // 사용자 이메일
    private String username;  // 사용자 이름
    private Integer roomId;   // 현재 속한 방 ID
}

/* 실제 JSON 형태는 다음과 같습니다:
{
    "userId": 123,
    "email": "user@example.com",
    "username": "홍길동",
    "roomId": 456
}
*/