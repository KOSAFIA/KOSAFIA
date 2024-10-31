package com.kosafia.gameapp.dto.chat;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessage {
    private MessageType type;
    private String userId;
    private String userEmail;
    private String username;
    private String content;
    private LocalDateTime timestamp;

    public enum MessageType {
        CHAT,
        ENTER,
        LEAVE
    }
}