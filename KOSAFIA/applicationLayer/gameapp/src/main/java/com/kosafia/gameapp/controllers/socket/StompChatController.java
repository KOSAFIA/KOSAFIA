package com.kosafia.gameapp.controllers.socket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.kosafia.gameapp.dto.chat.ChatMessage;
import com.kosafia.gameapp.dto.chat.ChatMessage.MessageType;

import java.time.LocalDateTime;

//스톰프로 채팅 관리하는 컨트롤러 매핑을 얘가 담당해요. 저장하고 뿌리는것 까지
@Controller
public class StompChatController {

    @MessageMapping("/lobby.chat")
    @SendTo("/topic/lobby")
    public ChatMessage handleChat(@Payload ChatMessage chatMessage) {
        return ChatMessage.builder()
                .type(MessageType.CHAT)
                .userId(chatMessage.getUserId())
                .userEmail(chatMessage.getUserEmail())
                .username(chatMessage.getUsername())
                .content(chatMessage.getContent())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @MessageMapping("/lobby.enter")
    @SendTo("/topic/lobby")
    public ChatMessage handleEnter(@Payload ChatMessage chatMessage) {
        return ChatMessage.builder()
                .type(MessageType.ENTER)
                .userId(chatMessage.getUserId())
                .userEmail(chatMessage.getUserEmail())
                .username(chatMessage.getUsername())
                .content(chatMessage.getUsername() + "님이 입장하셨습니다.")
                .timestamp(LocalDateTime.now())
                .build();
    }
}