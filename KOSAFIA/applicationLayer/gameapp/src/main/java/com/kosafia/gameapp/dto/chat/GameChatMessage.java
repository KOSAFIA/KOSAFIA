package com.kosafia.gameapp.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameChatMessage {
    private MessageType type;    // NORMAL, MAFIA, SYSTEM 등
    private String sender;       // 발신자
    private String content;      // 메시지 내용
    private String role;         // 발신자 역할
    private String timestamp;    // 타임스탬프
    private String sessionId;    // 세션 ID

    public enum MessageType {
        NORMAL, MAFIA, SYSTEM
    }
}