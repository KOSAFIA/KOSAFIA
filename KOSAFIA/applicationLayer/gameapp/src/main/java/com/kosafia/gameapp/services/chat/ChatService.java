package com.kosafia.gameapp.services.chat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.kosafia.gameapp.dto.chat.ChatMessage;
import com.kosafia.gameapp.dto.chat.ChatMessage.MessageType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final Set<ChatUser> connectedUsers = ConcurrentHashMap.newKeySet();
    public List<ChatUser> getConnectedUsers() {
        return new ArrayList<>(connectedUsers);
    }
    public void addUser(String userId, String username) {
        connectedUsers.add(new ChatUser(userId, username));
    }
    public void removeUser(String userId) {
        connectedUsers.removeIf(user -> user.getUserId().equals(userId));
    }
    public ChatMessage createChatMessage(ChatMessage chatMessage) {
        return ChatMessage.builder()
                .type(MessageType.CHAT)
                .userId(chatMessage.getUserId())
                .username(chatMessage.getUsername())
                .content(chatMessage.getContent())
                .timestamp(LocalDateTime.now())
                .build();
    }

    public ChatMessage createEnterMessage(ChatMessage chatMessage) {
        return ChatMessage.builder()
                .type(MessageType.ENTER)
                .userId(chatMessage.getUserId())
                .username(chatMessage.getUsername())
                .content(chatMessage.getUsername() + "님이 입장하셨습니다.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    public ChatMessage createLeaveMessage(ChatMessage chatMessage) {
        return ChatMessage.builder()
                .type(MessageType.LEAVE)
                .userId(chatMessage.getUserId())
                .username(chatMessage.getUsername())
                .content(chatMessage.getUsername() + "님이 퇴장하셨습니다.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Data
    @AllArgsConstructor
    private static class ChatUser {
        private String userId;
        private String username;
    }
}