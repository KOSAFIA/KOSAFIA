package com.kosafia.gameapp.utiles.socket;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
// import com.kosafia.gameapp.dto.ChatMessage;
// import com.kosafia.gameapp.dto.RoomUpdateMessage;
// import com.kosafia.gameapp.dto.PlayerStatusMessage;
import com.kosafia.gameapp.models.socketenum.GamePhase;

/**
 * WebSocket 메시지 전송을 담당하는 유틸리티 클래스
 * 모든 실시간 메시지 전송은 이 클래스를 통해 이루어짐
 * 책임: 다양한 종류의 WebSocket 메시지를 적절한 대상에게 전송
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketUtil {
    private final SimpMessageSendingOperations messagingTemplate;

    /**
     * 로비 전체에 메시지를 전송
     * @param message 전송할 메시지 객체
     */
    public void sendToLobby(Object message) {
        log.debug("Sending message to lobby: {}", message);
        messagingTemplate.convertAndSend("/topic/lobby", message);
    }

    /**
     * 특정 게임방에 메시지를 전송
     * @param roomId 게임방 ID
     * @param message 전송할 메시지 객체
     */
    public void sendToRoom(String roomId, Object message) {
        log.debug("Sending message to room {}: {}", roomId, message);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
    }

    /**
     * 게임 진행 중 특정 페이즈의 메시지를 전송
     * @param roomId 게임방 ID
     * @param phase 게임 페이즈
     * @param message 전송할 메시지
     */
    public void sendToGame(String roomId, GamePhase phase, Object message) {
        log.debug("Sending game message to room {} in phase {}: {}", 
                 roomId, phase, message);
        messagingTemplate.convertAndSend(
            "/topic/game/" + roomId + "/" + phase.toString().toLowerCase(), 
            message
        );
    }

    /**
     * 특정 역할을 가진 플레이어들에게만 메시지 전송
     * @param roomId 게임방 ID
     * @param role 대상 역할(마피아, 의사, 경찰 등)
     * @param message 전송할 메시지
     */
    public void sendToRole(String roomId, String role, Object message) {
        log.debug("Sending role-specific message to {} in room {}: {}", 
                 role, roomId, message);
        messagingTemplate.convertAndSend(
            "/topic/game/" + roomId + "/role/" + role, 
            message
        );
    }
}
