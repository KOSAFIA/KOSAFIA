package com.kosafia.gameapp.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 게임 참여 요청 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinGameRequest {
    private String sessionId;
    private String playerId;
    private GameRole role;
}