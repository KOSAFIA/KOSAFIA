package com.kosafia.gameapp.dto.kny;

import lombok.Data;

@Data
public class GameRoomDTO {
    private Long roomId;
    private String roomName;
    private int maxPlayers;
    private int currentPlayers;
    private boolean isPrivate;
    private String roomStatus;
    private String roomPassword; // 비밀번호 추가
}
