package com.kosafia.gameapp.controllers.socket;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.kosafia.gameapp.models.socketdto.ChatMessage;
import com.kosafia.gameapp.models.socketenum.GamePhase;
import com.kosafia.gameapp.services.chat.ChatService;
import com.kosafia.gameapp.services.gameState.GameStateService;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final GameStateService gameStateService;

    /**
     * 로비 채팅 메시지 처리
     */
    @MessageMapping("/chat.lobby")
    public void handleLobbyMessage(@Payload ChatMessage message, 
                                 SimpMessageHeaderAccessor headerAccessor) {
        setupMessageMetadata(message, headerAccessor);
        chatService.sendLobbyMessage(message);
    }

    /**
     * 게임방 채팅 메시지 처리
     */
    @MessageMapping("/chat.room")
    public void handleRoomMessage(@Payload ChatMessage message,
                                SimpMessageHeaderAccessor headerAccessor) {
        setupMessageMetadata(message, headerAccessor);
        String roomId = message.getRoomId();
        GamePhase currentPhase = gameStateService.getCurrentPhase(roomId);
        
        chatService.sendGameMessage(roomId, currentPhase, message.getRole(), message);
    }

    private void setupMessageMetadata(ChatMessage message, 
                                    SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        message.setTimestamp(LocalDateTime.now());
        // 세션에서 사용자 정보를 가져와 설정
        // 실제 구현시에는 세션에 저장된 사용자 정보를 사용
    }
}
