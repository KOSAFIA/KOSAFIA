package com.kosafia.gameapp.models.gameroom;

import lombok.*;

//김남영 어노테이션 추가
//왜 생성자 어노테이션이 따로 추가되어야하는가??? == Json형식으로 받은 파라미터를 Player타입으로 변환하려면 있어야된다고 하네요.
// 이렇게 하면:
// Jackson이 JSON을 Player 객체로 변환할 수 있게 됨
// WebSocket을 통한 메시지 전송이 정상적으로 작동
// 클라이언트-서버 간 Player 객체 통신이 가능
//-by claude-
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Player {
    private Integer playerNumber; // 방에 들어온 순서대로 1~8
    private String username; // 유저 닉네임
    private String userEmail; // 유저 이메일
    private Role role; // 역할 Enum (시민, 경찰, 의사, 마피아 등)
    private boolean isAlive; // 생존 여부
    private Integer target; // 마지막에 선택한 플레이어 번호
    private Result result;

    public Player(Integer playerNumber, String username, String userEmail) {
        this.playerNumber = playerNumber;
        this.username = username;
        this.userEmail = userEmail;
        this.role = Role.NONE;
        this.isAlive = true; // 기본 생존 상태
        this.target = null;
        this.result = Result.NONE;
        //
    }
}
