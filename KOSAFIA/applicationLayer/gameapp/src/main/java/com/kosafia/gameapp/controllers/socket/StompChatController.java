package com.kosafia.gameapp.controllers.socket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import com.kosafia.gameapp.dto.chat.ChatMessage;
import com.kosafia.gameapp.dto.chat.ChatMessage.MessageType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

//스톰프로 채팅 관리하는 컨트롤러 매핑을 얘가 담당해요. 저장하고 뿌리는것 까지
@Slf4j
@Controller
@RequiredArgsConstructor
public class StompChatController {
    private final Set<ChatUser> connectedUsers = ConcurrentHashMap.newKeySet();
    private final SimpMessageSendingOperations messagingTemplate;  // 생성자 주입

    @MessageMapping("/lobby.chat")
    @SendTo("/topic/lobby")
    public ChatMessage handleChat(@Payload ChatMessage chatMessage) {
        log.debug("Received chat message: {}", chatMessage);  // 로그 추가
        return ChatMessage.builder()
                .type(MessageType.CHAT)
                .userId(chatMessage.getUserId())
                .username(chatMessage.getUsername())
                .content(chatMessage.getContent())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @MessageMapping("/lobby.enter")
    @SendTo("/topic/lobby")
    public ChatMessage handleEnter(@Payload ChatMessage chatMessage) {
        // 사용자 추가
        ChatUser newUser = new ChatUser(chatMessage.getUserId(), chatMessage.getUsername());
        connectedUsers.add(newUser);
        
        // 유저 리스트 브로드캐스트
        messagingTemplate.convertAndSend("/topic/users", new ArrayList<>(connectedUsers));

        return ChatMessage.builder()
                .type(MessageType.ENTER)
                .userId(chatMessage.getUserId())
                .username(chatMessage.getUsername())
                .content(chatMessage.getUsername() + "님이 입장하셨습니다.")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @MessageMapping("/lobby.leave")
    @SendTo("/topic/lobby")
    public ChatMessage handleLeave(@Payload ChatMessage chatMessage) {
        // 사용자 제거
        connectedUsers.removeIf(user -> user.getUserId().equals(chatMessage.getUserId()));
        
        // 유저 리스트 브로드캐스트
        messagingTemplate.convertAndSend("/topic/users", new ArrayList<>(connectedUsers));

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