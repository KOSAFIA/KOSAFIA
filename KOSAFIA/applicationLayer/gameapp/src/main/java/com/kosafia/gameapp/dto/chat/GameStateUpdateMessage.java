package com.kosafia.gameapp.dto.chat;

import java.time.LocalDateTime;

import lombok.*;

// 게임 상태 업데이트 메시지 DTO (웹소켓으로 클라이언트에게 전송)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStateUpdateMessage {
    private String sessionId;
    private GameState gameState;
    private LocalDateTime timestamp;
    
    public GameStateUpdateMessage(String sessionId, GameState gameState) {
        this.sessionId = sessionId;
        this.gameState = gameState;
        this.timestamp = LocalDateTime.now();
    }
}