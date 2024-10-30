package com.kosafia.gameapp.models.socketdto;

import lombok.Data;
import java.time.LocalDateTime;

import com.kosafia.gameapp.models.socketenum.MessageType;

/**
 * 채팅 메시지의 데이터를 담는 DTO
 */
@Data
public class ChatMessage {
    private MessageType type;    // 메시지 타입 (일반채팅, 시스템메시지 등)
    private String roomId;       // 채팅방 ID
    private String senderId;     // 발신자 ID
    private String senderName;   // 발신자 이름
    private String content;      // 메시지 내용
    private String role;         // 발신자 역할 (마피아, 시민 등)
    private LocalDateTime timestamp; // 발송 시간
}