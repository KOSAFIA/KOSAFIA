package com.kosafia.gameapp.models.chat;

import com.kosafia.gameapp.models.gameState.GameConstants.ChatType;
import com.kosafia.gameapp.models.gameState.GameConstants.GameRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessageDTO {
    private String messageId;        // 메시지 고유 ID
    private String roomId;           // 게임방 ID
    private String senderId;         // 발신자 ID
    private String senderName;       // 발신자 이름
    private String message;          // 메시지 내용
    private ChatType type;           // 채팅 타입
    private GameRole senderRole;     // 발신자 역할
    private LocalDateTime timestamp; // 발송 시간
}
