package com.kosafia.gameapp.dto.chat;
// 게임 상태 업데이트 요청 DTO
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStateUpdateRequest {
    private String sessionId;
    private GameState newState;
}

