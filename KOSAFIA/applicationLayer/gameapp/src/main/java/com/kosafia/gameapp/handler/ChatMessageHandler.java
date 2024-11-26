package com.kosafia.gameapp.handler;

import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;

import com.kosafia.gameapp.dto.chat.ChatMessage;
import com.kosafia.gameapp.services.chat.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatMessageHandler {
    private final ChatService chatService;
    private final SimpMessageSendingOperations messagingTemplate;

    public ChatMessage handleChatMessage(ChatMessage chatMessage) {
        log.debug("Received chat message: {}", chatMessage);
        return chatService.createChatMessage(chatMessage);
    }

    public ChatMessage handleUserEnter(ChatMessage chatMessage) {
        chatService.addUser(chatMessage.getUserId(), chatMessage.getUsername());
        broadcastUserList();
        return chatService.createEnterMessage(chatMessage);
    }

    public ChatMessage handleUserLeave(ChatMessage chatMessage) {
        chatService.removeUser(chatMessage.getUserId());
        broadcastUserList();
        return chatService.createLeaveMessage(chatMessage);
    }

    private void broadcastUserList() {
        messagingTemplate.convertAndSend("/topic/users", chatService.getConnectedUsers());
    }
}