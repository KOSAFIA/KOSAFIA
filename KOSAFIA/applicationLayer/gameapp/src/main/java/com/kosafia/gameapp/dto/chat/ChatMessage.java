package com.kosafia.gameapp.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@Builder
@NoArgsConstructor  // 이 부분 추가
@AllArgsConstructor // 이 부분 추가
public class ChatMessage {
    private MessageType type;
    private String userId;
    private String username;
    private String content;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime timestamp;

    public enum MessageType {
        CHAT, ENTER, LEAVE
    }
}