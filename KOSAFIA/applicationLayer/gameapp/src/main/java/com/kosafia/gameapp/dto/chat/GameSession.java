package com.kosafia.gameapp.dto.chat;

import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

// GameSession DTO
@Data
@Builder
public class GameSession {
    private String sessionId;          // 게임방 ID
    private GameState gameState;       // 게임 상태
    private Map<String, Player> players; // <playerId, Player> 맵
    private List<GameChatMessage> chatHistory;
    private String finalVoteTarget;  // 최후 변론 대상자 ID
}