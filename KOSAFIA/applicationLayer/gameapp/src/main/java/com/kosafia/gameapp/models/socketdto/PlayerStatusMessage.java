package com.kosafia.gameapp.models.socketdto;

import lombok.Data;

/**
 * 플레이어 상태 업데이트를 위한 DTO
 */
@Data
public class PlayerStatusMessage {
    private String playerId;         // 플레이어 ID
    private String playerName;       // 플레이어 이름
    private boolean ready;           // 준비 상태
    private String currentStatus;    // 현재 상태
}