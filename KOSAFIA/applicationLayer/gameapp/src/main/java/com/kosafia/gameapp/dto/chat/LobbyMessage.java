package com.kosafia.gameapp.dto.chat;

import com.kosafia.gameapp.dto.chat.ChatMessage.MessageType;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class LobbyMessage {
    private MessageType type;
    private Object data;
    private LocalDateTime timestamp;

    public enum MessageType {
        CHAT,
        USER_LIST,
        ROOM_LIST,
        USER_JOIN,
        USER_LEAVE
    }

}
