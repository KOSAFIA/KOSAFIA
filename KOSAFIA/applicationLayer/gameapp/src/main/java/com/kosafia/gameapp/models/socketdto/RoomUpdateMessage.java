package com.kosafia.gameapp.models.socketdto;

import lombok.Data;

/**
 * 게임방 정보 업데이트를 위한 DTO
 */
@Data
public class RoomUpdateMessage {
    private String roomId;           // 방 ID
    private String roomName;         // 방 이름
    private int playerCount;         // 현재 플레이어 수
    private int maxPlayers;          // 최대 플레이어 수
    private String roomStatus;       // 방 상태
}