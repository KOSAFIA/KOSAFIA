package com.kosafia.gameapp.dto.chat;

import lombok.*;

// 플레이어 상태 업데이트 요청 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerStateUpdateRequest {
    private String sessionId;
    private String playerId;
    private boolean isAlive;
}