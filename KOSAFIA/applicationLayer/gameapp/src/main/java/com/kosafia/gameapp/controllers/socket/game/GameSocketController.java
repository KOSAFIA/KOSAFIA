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

import java.util.List;

@Controller
public class GameSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    // private GameService gameService; 이런 서비스 없자나...

    // 채팅 메시지 처리
    @MessageMapping("/game.chat.send/{roomKey}")
    public void handleGameChat(@DestinationVariable Integer roomKey, ChatMessage message) {
        System.out.println("채팅 메시지 받음: " + message);
        messagingTemplate.convertAndSend("/topic/game.chat." + roomKey, message);
    }

    // 마피아가 타겟 선택했을 때
    @MessageMapping("/game.mafia.target/{roomKey}")
    public void handleMafiaTarget(@DestinationVariable Integer roomKey, 
                                @Payload MafiaTargetMessage targetMessage) {
        System.out.println("마피아가 타겟 선택: " + targetMessage);
        
        // 같은 방의 다른 마피아들에게도 타겟 정보 전달
        messagingTemplate.convertAndSend(
            "/topic/game.mafia.target." + roomKey, 
            targetMessage
        );
    }

    // 게임 상태 변경 알림(안쓸 예정인데... 확장될수도 있지 않을까. 쓰면 실시간 처리 가능한데 로직이 복잡해지겠지)
    @MessageMapping("/game.state.change/{roomKey}")
    public void handleGameStateChange(@DestinationVariable Integer roomKey, 
                                    @Payload GameStateMessage stateMessage) {
        System.out.println("게임 상태 변경: " + stateMessage);
        
        // 모든 플레이어에게 새로운 게임 상태 전달
        messagingTemplate.convertAndSend(
            "/topic/game.state." + roomKey, 
            stateMessage
        );
    }
}

// 채팅 메시지 형식 게임 중에 받아야할 채팅 객체, 
// 일반 룸채팅과 다른건 역할과 현재 게임 상태값이 포함되어야함.
class ChatMessage {
    private String username;
    private String content;
    private GameStatus gameStatus;
    private Role role;
}

// 마피아 타겟 메시지 형식 마피아가 암살 시도 할때 어떤 형태로 메시지를 보내는지
class MafiaTargetMessage {
    private Integer mafiaId;
    private Integer targetId;
    private Integer roomKey;
}

// 게임 상태 메시지 형식 게임 상태 변경 알림 메시지 형식 ((일단 안쓸 예정이지 않을까?))
class GameStateMessage {
    private GameStatus gameStatus;
    private List<Player> players;
}
