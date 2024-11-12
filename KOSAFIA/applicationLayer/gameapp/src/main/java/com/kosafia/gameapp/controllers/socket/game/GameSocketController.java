package com.kosafia.gameapp.controllers.socket.game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;
import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;

import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@Controller
public class GameSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RoomRepository roomRepository;  

    // 채팅 메시지 처리 - @Payload 어노테이션 추가 및 디버그 로그 추가
    @MessageMapping("/game.chat.send/{roomKey}")
    public void handleGameChat(
        @DestinationVariable("roomKey") Integer roomKey, 
        @Payload ChatMessage message
    ) {
        log.info("게임 채팅 메시지 수신 - 방: {}, 메시지: {}", roomKey, message);
        try {
            // 메시지 유효성 검사
            if (message == null || message.username() == null || message.content() == null) {
                log.error("잘못된 채팅 메시지 형식: {}", message);
                return;
            }

            // 메시지 전송
            messagingTemplate.convertAndSend("/topic/game.chat." + roomKey, message);
            log.info("채팅 메시지 전송 완료 - 방: {}, 사용자: {}, 내용: {}", 
                roomKey, message.username(), message.content());
        } catch (Exception e) {
            log.error("채팅 메시지 처리 중 오류 발생:", e);
        }
    }

    // 마피아가 타겟 선택했을 때
    @MessageMapping("/game.mafia.target/{roomKey}")
    public void handleMafiaTarget(@DestinationVariable("roomKey") Integer roomKey, 
                                @Payload MafiaTargetMessage targetMessage) {
        log.info("마피아가 타겟 선택: {}", targetMessage);
        
        // 같은 방의 다른 마피아들에게도 타겟 정보 전달
        messagingTemplate.convertAndSend(
            "/topic/game.mafia.target." + roomKey, 
            targetMessage
        );
    }

    // 게임 상태 변경 알림(안쓸 예정인데... 확장될수도 있지 않을까. 쓰면 실시간 처리 가능한데 로직이 복잡해지겠지)
    @MessageMapping("/game.state.change/{roomKey}")
    public void handleGameStateChange(@DestinationVariable("roomKey") Integer roomKey, 
                                    @Payload GameStateMessage stateMessage) {
        log.info("게임 상태 변경: {}", stateMessage);
        
        // 모든 플레이어에게 새로운 게임 상태 전달
        messagingTemplate.convertAndSend(
            "/topic/game.state." + roomKey, 
            stateMessage
        );
    }

    // 채팅 메시지 형식 게임 중에 받아야할 채팅 객체, 
// 일반 룸채팅과 다른건 역할과 현재 게임 상태값이 포함되어야함.
record ChatMessage(
    String username,
    String content,
    String gameStatus,
    String role,
    Integer roomKey
){}

// 마피아 타겟 메시지 형식 마피아가 암살 시도 할때 어떤 형태로 메시지를 보내는지
record MafiaTargetMessage(
    Integer mafiaId,
    Integer targetId,
    Integer roomKey
){}

// 게임 상태 메시지 형식 게임 상태 변경 알림 메시지 형식 ((일단 안쓸 예정이지 않을까?)) 
record GameStateMessage(
    String gameStatus,
    List<Player> players
){}

    @MessageMapping("/game.state.update/{roomKey}")
    public void broadcastGameState(
        @DestinationVariable("roomKey") Integer roomKey,
        @Payload String gameState
    ) {
        try {
            log.info("게임 상태 브로드캐스트 - 방: {}", roomKey);
            messagingTemplate.convertAndSend(
                "/topic/game.state." + roomKey, 
                gameState
            );
        } catch (Exception e) {
            log.error("게임 상태 브로드캐스트 실패", e);
        }
    }

    // 플레이어 상태 업데이트 브로드캐스트
    @MessageMapping("/game.players.update/{roomKey}")
    public void broadcastPlayerUpdate(
        @DestinationVariable("roomKey") Integer roomKey,
        @Payload List<Player> updatedPlayers
    ) {
        try {
            log.info("플레이어 상태 업데이트 브로드캐스트 시작 - 방: {}", roomKey);

            Room room = roomRepository.getRoom(roomKey);
            
            // 업데이트된 플레이어 정보를 포함한 응답 객체 생성
            PlayerUpdateResponse response = new PlayerUpdateResponse(
                room.getGameStatus().toString(),
                updatedPlayers,
                true,
                "플레이어 상태가 업데이트되었습니다."
            );

            // 해당 방의 모든 클라이언트에게 브로드캐스트
            messagingTemplate.convertAndSend(
                "/topic/game.players." + roomKey, 
                response
            );
            
            log.info("플레이어 상태 업데이트 브로드캐스트 완료 - 방: {}, 플레이어 수: {}", 
                roomKey, room.getPlayers().size());
        } catch (Exception e) {
            log.error("플레이어 상태 업데이트 브로드캐스트 실패", e);
            
            // 에러 응답 브로드캐스트
            PlayerUpdateResponse errorResponse = new PlayerUpdateResponse(
                null, null, false, 
                "플레이어 상태 업데이트 중 오류가 발생했습니다: " + e.getMessage()
            );
            messagingTemplate.convertAndSend(
                "/topic/game.players." + roomKey, 
                errorResponse
            );
        }
    }

    // 플레이어 업데이트 응답 형식
    record PlayerUpdateResponse(
        String gameStatus,
        List<Player> players,
        boolean success,
        String message
    ) {}

}
