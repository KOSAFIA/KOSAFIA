package com.kosafia.gameapp.models.socketdto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 채팅 메시지의 데이터를 담는 DTO
 */
@Data
public class ChatMessage {
    private String messageId;        // 메시지 고유 ID
    private String senderId;         // 발신자 ID
    private String senderName;       // 발신자 이름
    private String content;          // 메시지 내용
    private LocalDateTime timestamp; // 발송 시간
    private String messageType;      // 메시지 타입
}