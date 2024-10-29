package com.kosafia.gameapp.utiles.socket;

import com.kosafia.gameapp.models.gameState.GameConstants.ChatType;
import com.kosafia.gameapp.models.chat.ChatMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * WebSocket 메시지 전송을 위한 유틸리티 클래스
 * 다양한 유형의 메시지를 적절한 대상에게 전송하는 메서드들을 제공
 */
@Component
@RequiredArgsConstructor
public class WebSocketUtil {
    // Spring의 메시지 전송을 위한 템플릿
    private final SimpMessageSendingOperations messagingTemplate;
    
    /**
     * 전체 공개 채팅 메시지 전송
     * @param roomId 게임방 ID
     * @param message 전송할 채팅 메시지
     */
    public void sendPublicMessage(String roomId, ChatMessageDTO message) {
        String destination = String.format("/topic/room/%s/public", roomId);
        messagingTemplate.convertAndSend(destination, message);
    }
    
    /**
     * 마피아 전용 채팅 메시지 전송
     * @param roomId 게임방 ID
     * @param message 전송할 채팅 메시지
     */
    public void sendMafiaMessage(String roomId, ChatMessageDTO message) {
        String destination = String.format("/topic/room/%s/mafia", roomId);
        messagingTemplate.convertAndSend(destination, message);
    }
    
    /**
     * 시스템 메시지 전송
     * @param roomId 게임방 ID
     * @param message 시스템 메시지 내용
     */
    public void sendSystemMessage(String roomId, String message) {
        String destination = String.format("/topic/room/%s/system", roomId);
        // 시스템 메시지 DTO 생성
        ChatMessageDTO systemMessage = ChatMessageDTO.builder()
                .messageId(UUID.randomUUID().toString())
                .roomId(roomId)
                .message(message)
                .type(ChatType.SYSTEM)
                .timestamp(LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSend(destination, systemMessage);
    }
    
    /**
     * 특정 사용자에게 개인 메시지 전송
     * @param userId 수신자 ID
     * @param message 전송할 메시지
     */
    public void sendPrivateMessage(String userId, String message) {
        String destination = String.format("/queue/private/%s", userId);
        messagingTemplate.convertAndSendToUser(userId, destination, message);
    }
}