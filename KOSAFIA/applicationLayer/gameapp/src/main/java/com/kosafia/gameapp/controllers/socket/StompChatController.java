package com.kosafia.gameapp.controllers.socket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.kosafia.gameapp.dto.chat.ChatMessage;
import com.kosafia.gameapp.handler.ChatMessageHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class StompChatController {
    private final ChatMessageHandler chatMessageHandler;

    @MessageMapping("/lobby.chat")
    @SendTo("/topic/lobby")
    public ChatMessage handleChat(@Payload ChatMessage chatMessage) {
        return chatMessageHandler.handleChatMessage(chatMessage);
    }

    @MessageMapping("/lobby.enter")
    @SendTo("/topic/lobby")
    public ChatMessage handleEnter(@Payload ChatMessage chatMessage) {
        return chatMessageHandler.handleUserEnter(chatMessage);
    }

    @MessageMapping("/lobby.leave")
    @SendTo("/topic/lobby")
    public ChatMessage handleLeave(@Payload ChatMessage chatMessage) {
        return chatMessageHandler.handleUserLeave(chatMessage);
    }
}