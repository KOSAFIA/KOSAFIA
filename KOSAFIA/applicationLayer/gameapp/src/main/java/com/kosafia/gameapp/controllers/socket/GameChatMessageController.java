package com.kosafia.gameapp.controllers.socket;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.kosafia.gameapp.dto.chat.GameChatMessage;
import com.kosafia.gameapp.dto.chat.GameRole;
import com.kosafia.gameapp.dto.chat.GameSession;
import com.kosafia.gameapp.dto.chat.GameSessionService;
import com.kosafia.gameapp.dto.chat.GameState;
import com.kosafia.gameapp.dto.chat.Player;
import com.kosafia.gameapp.dto.chat.GameChatMessage.MessageType;

@Controller
public class GameChatMessageController {

    private final GameSessionService gameSessionService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public GameChatMessageController(SimpMessagingTemplate messagingTemplate, GameSessionService gameSessionService) {
        this.messagingTemplate = messagingTemplate; this.gameSessionService = gameSessionService;
    }

        // 일반 채팅
    @MessageMapping("/room.{roomId}")
    @SendTo("/topic/room.{roomId}")
    public GameChatMessage handleGameChat(
        @DestinationVariable String roomId,
        GameChatMessage message,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        // 세션에서 현재 게임 상태와 플레이어 상태 확인
        GameSession session = gameSessionService.getSession(roomId);
        Player player = session.getPlayers().get(message.getSender());
        String playerId = message.getSender();
        

        // // 메시지 전송 가능 여부 확인
        // if (!player.isAlive()) {
        //     throw new IllegalStateException("Dead players cannot send messages");
        // }

        // if (session.getGameState() == GameState.NIGHT 
        //     && player.getRole() != GameRole.MAFIA) {
        //     throw new IllegalStateException("Only mafia can chat during night");
        // }

        // 채팅 가능 여부 확인
        if (!gameSessionService.canChat(roomId, playerId)) {
            throw new IllegalStateException(getChatRestrictMessage(session.getGameState()));
        }

        // 채팅 히스토리에 저장
        session.getChatHistory().add(message);
        return message;
    }

    @MessageMapping("/room.{roomId}.mafia")
    @SendTo("/topic/room.{roomId}.mafia")
    public GameChatMessage handleMafiaChat(
        @DestinationVariable String roomId,
        GameChatMessage message,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        GameSession session = gameSessionService.getSession(roomId);
        Player player = session.getPlayers().get(message.getSender());

        // 마피아 채팅 권한 확인
        if (player.getRole() != GameRole.MAFIA) {
            throw new IllegalStateException("Only mafia can use mafia chat");
        }
        if (!player.isAlive()) {
            throw new IllegalStateException("Dead players cannot send messages");
        }

        message.setType(MessageType.MAFIA);
        session.getChatHistory().add(message);
        return message;
    }

    // 시스템 메시지
    public void sendGameSystemMessage(String roomId, String content) {
        GameChatMessage message = GameChatMessage.builder()
            .type(MessageType.SYSTEM)
            .sender("SYSTEM")
            .content(content)
            .role("SYSTEM")
            .timestamp(LocalDateTime.now().toString())
            .build();
            
        messagingTemplate.convertAndSend("/topic/room." + roomId, message);
    }    

        // 채팅 히스토리 요청 처리
    @MessageMapping("/room.{roomId}.history")
    @SendTo("/topic/room.{roomId}")
    public List<GameChatMessage> handleHistoryRequest(
        @DestinationVariable String roomId
    ) {
        return gameSessionService.getChatHistory(roomId);
    }

        // 참가자 목록 요청 처리
    @MessageMapping("/room.{roomId}.participants.get")
    @SendTo("/topic/room.{roomId}.participants")
    public List<Player> handleParticipantsRequest(
        @DestinationVariable String roomId
    ) {
        return gameSessionService.getSessionPlayers(roomId);
    }

     // 새 참가자 입장 시 브로드캐스트
     @SendTo("/topic/room.{roomId}.participants")
     public List<Player> broadcastParticipants(
         @DestinationVariable String roomId
     ) {
         return gameSessionService.getSessionPlayers(roomId);
     }
    // 채팅 제한 메시지 생성
    private String getChatRestrictMessage(GameState gameState) {
        switch (gameState) {
            case VOTE:
                return "투표 시간에는 채팅이 불가능합니다.";
            case FINAL_VOTE:
                return "최후 변론 시간에는 대상자만 채팅이 가능합니다.";
            case NIGHT:
                return "밤에는 마피아만 채팅이 가능합니다.";
            default:
                return "현재 채팅이 불가능한 상태입니다.";
        }
    }   
}
