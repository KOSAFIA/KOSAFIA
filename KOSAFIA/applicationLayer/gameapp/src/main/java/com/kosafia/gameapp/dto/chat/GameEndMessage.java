package com.kosafia.gameapp.dto.chat;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

// 게임 종료 메시지 DTO
@Data
@AllArgsConstructor
public class GameEndMessage {
    private String sessionId;
    private LocalDateTime timestamp;
}
