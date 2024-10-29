package com.kosafia.gameapp.services.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.kosafia.gameapp.models.socketdto.ChatMessage;
import com.kosafia.gameapp.models.socketenum.GamePhase;
import com.kosafia.gameapp.utiles.socket.WebSocketUtil;

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스
 * 책임: 채팅 메시지의 처리 및 전달을 관리
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService{
    private final WebSocketUtil webSocketUtil;

    /**
     * 로비 채팅 메시지 전송
     * @param message 채팅 메시지
     */
    public void sendLobbyMessage(ChatMessage message) {
        log.debug("Processing lobby message: {}", message);
        webSocketUtil.sendToLobby(message);
    }

    /**
     * 게임방 채팅 메시지 전송
     * @param roomId 게임방 ID
     * @param message 채팅 메시지
     */
    public void sendRoomMessage(String roomId, ChatMessage message) {
        log.debug("Processing room message for room {}: {}", roomId, message);
        webSocketUtil.sendToRoom(roomId, message);
    }

    /**
     * 게임 진행 중 채팅 메시지 전송
     * 게임 페이즈와 역할에 따라 다른 처리
     * @param roomId 게임방 ID
     * @param phase 현재 게임 페이즈
     * @param role 발신자 역할
     * @param message 채팅 메시지
     */
    public void sendGameMessage(String roomId, GamePhase phase, 
                              String role, ChatMessage message) {
        log.debug("Processing game message for room {} in phase {}: {}", 
                 roomId, phase, message);
                 
        if (phase == GamePhase.NIGHT) {
            // 밤에는 역할별로 채팅 분리
            webSocketUtil.sendToRole(roomId, role, message);
        } else {
            // 다른 페이즈에서는 전체 채팅
            webSocketUtil.sendToGame(roomId, phase, message);
        }
    }
}