package com.kosafia.gameapp.models.gameroom;

import lombok.Data;

@Data
public class Player {
    private Integer playerNumber; // 방에 들어온 순서대로 1~8
    private String username; // 유저 닉네임
    private String userEmail; // 유저 이메일
    private Role role; // 역할 Enum (시민, 경찰, 의사, 마피아 등)
    private boolean isAlive; // 생존 여부
    private Integer target; // 마지막에 선택한 플레이어 번호

    public Player(Integer playerNumber, String username, String userEmail) {
        this.playerNumber = playerNumber;
        this.username = username;
        this.userEmail = userEmail;
        this.role = Role.NONE;
        this.isAlive = true; // 기본 생존 상태
        this.target = null;
        //
    }
}
