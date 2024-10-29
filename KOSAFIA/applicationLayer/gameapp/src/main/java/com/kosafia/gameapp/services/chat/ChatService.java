package com.kosafia.gameapp.services.chat;

import com.kosafia.gameapp.models.gameState.GameConstants.GamePhase;
import com.kosafia.gameapp.models.gameState.GameConstants.GameRole;
import com.kosafia.gameapp.services.gameState.GameStateService;
import com.kosafia.gameapp.models.chat.ChatMessageDTO;
import com.kosafia.gameapp.utiles.socket.WebSocketUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스 클래스
 * 게임 상태와 사용자 역할에 따라 채팅 메시지를 적절히 처리
 */
@Service
@RequiredArgsConstructor
public class ChatService {
    private final WebSocketUtil webSocketUtil;
    // 게임 상태 관리를 위한 서비스
    private final GameStateService gameStateService;
    
    /**
     * 채팅 메시지 처리 메인 메서드
     * 게임 단계와 사용자 역할에 따라 적절한 처리 메서드로 분기
     * @param message 처리할 채팅 메시지 DTO
     */
    public void handleChatMessage(ChatMessageDTO message) {
        String roomId = message.getRoomId();
        // 현재 게임 단계 조회
        GamePhase currentPhase = gameStateService.getCurrentPhase(roomId);
        // 메시지 발신자의 역할 조회
        GameRole senderRole = gameStateService.getUserRole(roomId, message.getSenderId());
        
        // 게임 단계별 메시지 처리
        switch (currentPhase) {
            case NIGHT:
                handleNightPhaseChat(message, senderRole);
                break;
            case DAY:
            case VOTE:
            case FINAL_VOTE:
                handleDayPhaseChat(message);
                break;
            case WAITING:
                handleWaitingPhaseChat(message);
                break;
        }
    }
    
    /**
     * 밤 단계의 채팅 처리
     * 마피아만 채팅이 가능하며, 마피아끼리만 볼 수 있음
     * @param message 채팅 메시지
     * @param role 발신자의 역할
     */
    private void handleNightPhaseChat(ChatMessageDTO message, GameRole role) {
        if (role == GameRole.MAFIA) {
            webSocketUtil.sendMafiaMessage(message.getRoomId(), message);
        }
        // 다른 역할의 메시지는 무시됨
    }
    
    /**
     * 낮 단계의 채팅 처리
     * 모든 플레이어가 채팅 가능
     * @param message 채팅 메시지
     */
    private void handleDayPhaseChat(ChatMessageDTO message) {
        webSocketUtil.sendPublicMessage(message.getRoomId(), message);
    }
    
    /**
     * 대기 단계의 채팅 처리
     * 게임 시작 전 자유로운 채팅
     * @param message 채팅 메시지
     */
    private void handleWaitingPhaseChat(ChatMessageDTO message) {
        webSocketUtil.sendPublicMessage(message.getRoomId(), message);
    }
}