package com.kosafia.gameapp.knyTestSet;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class KnyLoginService {

    // UserMapper 의존성 주입
    private final KnyUserMapper userMapper;

    /**
     * 로그인 처리를 수행하는 메서드
     * @param loginRequest 로그인 요청 정보 (이메일, 비밀번호)
     * @return LoginResponse 로그인 결과 정보
     */
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // 1. 이메일로 사용자 조회
            KnyUserDTO user = userMapper.findUserByEmail(loginRequest.getEmail());
            
            // 2. 사용자가 존재하지 않는 경우
            if (user == null) {
                log.info("사용자를 찾을 수 없음: {}", loginRequest.getEmail());
                return null;
            }

            // 3. 비밀번호 일치 여부 확인 (평문 비교)
            if (!loginRequest.getPassword().equals(user.getPassword())) {
                log.info("비밀번호 불일치: {}", loginRequest.getEmail());
                return null;
            }

            // 4. 사용자 상태 확인 (1: 활동, 0: 탈퇴)
            if (user.isStatus()) {
                log.info("비활성화된 계정: {}", loginRequest.getEmail());
                return null;
            }

            // 5. 로그인 성공 시 응답 생성
            return LoginResponse.builder()
                    .userId(user.getUser_id())
                    .email(user.getUser_email())
                    .username(user.getUsername())
                    .build();

        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생", e);
            return null;
        }
    }
}