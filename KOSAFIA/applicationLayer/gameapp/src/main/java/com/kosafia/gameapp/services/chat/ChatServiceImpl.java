package com.kosafia.gameapp.services.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.kosafia.gameapp.models.socketdto.ChatMessage;
import com.kosafia.gameapp.models.socketenum.GamePhase;
import com.kosafia.gameapp.models.socketenum.MessageType;
import com.kosafia.gameapp.services.gameState.GameStateService;
import com.kosafia.gameapp.utiles.socket.WebSocketUtil;

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스
 * 책임: 채팅 메시지의 처리 및 전달을 관리
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final WebSocketUtil webSocketUtil;
    private final GameStateService gameStateService;

    @Override
    public void sendLobbyMessage(ChatMessage message) {
        log.debug("Sending lobby message: {}", message);
        
        // 메시지 검증
        validateMessage(message);
        
        // 로비 전체에 메시지 전송
        webSocketUtil.sendToLobby(message);
    }

    @Override
    public void sendGameMessage(String roomId, GamePhase phase, 
                              String role, ChatMessage message) {
        log.debug("Sending game message. Room: {}, Phase: {}, Role: {}", 
                 roomId, phase, role);

        // 현재 페이즈에 따른 메시지 전송 규칙 적용
        switch (phase) {
            case NIGHT:
                handleNightPhaseMessage(roomId, role, message);
                break;
            case DAY:
                handleDayPhaseMessage(roomId, message);
                break;
            case VOTE:
                handleVotePhaseMessage(roomId, message);
                break;
            case FINAL_VOTE:
                handleFinalVotePhaseMessage(roomId, message);
                break;
            default:
                handleWaitingPhaseMessage(roomId, message);
        }
    }

    private void handleNightPhaseMessage(String roomId, String role, 
                                       ChatMessage message) {
        // 밤에는 마피아끼리만 채팅 가능
        if ("MAFIA".equals(role)) {
            webSocketUtil.sendToRole(roomId, "MAFIA", message);
        }
        // 다른 특수 직업들의 채팅/액션 처리
    }

    private void handleDayPhaseMessage(String roomId, ChatMessage message) {
        // 낮에는 모든 생존자가 채팅 가능
        webSocketUtil.sendToRoom(roomId, message);
    }

    private void handleVotePhaseMessage(String roomId, ChatMessage message) {
        // 투표 중에는 제한된 메시지만 허용
        if (message.getType() == MessageType.GAME_VOTE) {
            webSocketUtil.sendToRoom(roomId, message);
        }
    }

    private void handleFinalVotePhaseMessage(String roomId, ChatMessage message) {
        // 최후 변론 중에는 지목된 사람만 채팅 가능
        // 실제 구현시에는 지목된 사람 체크 로직 필요
        webSocketUtil.sendToRoom(roomId, message);
    }

    private void handleWaitingPhaseMessage(String roomId, ChatMessage message) {
        // 대기 중에는 모든 참가자가 채팅 가능
        webSocketUtil.sendToRoom(roomId, message);
    }

    private void validateMessage(ChatMessage message) {
        if (message.getContent() == null || message.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }
        // 추가적인 검증 로직
    }

    @Override
    public void sendRoomMessage(String roomId, ChatMessage message) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'sendRoomMessage'");
    }
}