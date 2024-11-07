package com.kosafia.gameapp.dto.chat;

import java.time.LocalDateTime;

import lombok.*;

// 플레이어 상태 업데이트 메시지 DTO (웹소켓으로 클라이언트에게 전송)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerStateUpdateMessage {
    private String sessionId;
    private String playerId;
    private boolean isAlive;
    private LocalDateTime timestamp;

    public PlayerStateUpdateMessage(String sessionId, String playerId, boolean isAlive) {
        this.sessionId = sessionId;
        this.playerId = playerId;
        this.isAlive = isAlive;
        this.timestamp = LocalDateTime.now();
    }
}