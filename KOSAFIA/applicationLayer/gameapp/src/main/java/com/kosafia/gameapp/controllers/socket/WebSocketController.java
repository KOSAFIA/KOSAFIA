package com.kosafia.gameapp.controllers.socket;

import com.kosafia.gameapp.models.chat.ChatMessageDTO;
import com.kosafia.gameapp.models.chat.JoinMessageDTO;
import com.kosafia.gameapp.models.chat.LeaveMessageDTO;
import com.kosafia.gameapp.services.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

/**
 * WebSocket 메시지를 처리하는 컨트롤러
 * 클라이언트로부터 받은 WebSocket 메시지를 적절한 서비스로 라우팅
 */
@Controller
@RequiredArgsConstructor
public class WebSocketController {
    private final ChatService chatService;
    
    /**
     * 채팅 메시지 처리 메서드
     * 클라이언트가 /app/chat.send로 메시지를 보내면 호출됨
     * @param message 클라이언트로부터 받은 채팅 메시지
     */
    @MessageMapping("/chat.send")
    public void handleChat(@Payload ChatMessageDTO message) {
        chatService.handleChatMessage(message);
    }
    
    /**
     * 게임방 입장 처리 메서드
     * 클라이언트가 /app/chat.join으로 메시지를 보내면 호출됨
     * @param message 입장 정보를 담은 메시지
     */
    @MessageMapping("/chat.join")
    public void handleJoin(@Payload JoinMessageDTO message) {
        // TODO: 입장 처리 로직 구현
    }
    
    /**
     * 게임방 퇴장 처리 메서드
     * 클라이언트가 /app/chat.leave로 메시지를 보내면 호출됨
     * @param message 퇴장 정보를 담은 메시지
     */
    @MessageMapping("/chat.leave")
    public void handleLeave(@Payload LeaveMessageDTO message) {
        // TODO: 퇴장 처리 로직 구현
    }
}