package com.kosafia.gameapp.services.gameState;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.kosafia.gameapp.models.socketdto.GameStateUpdateMessage;
import com.kosafia.gameapp.models.socketdto.SystemMessage;
import com.kosafia.gameapp.models.socketenum.GamePhase;
import com.kosafia.gameapp.repositories.kny.GameRepository;
import com.kosafia.gameapp.utiles.socket.WebSocketUtil;

/**
 * 게임 상태 변경과 관련된 실시간 업데이트를 처리하는 서비스
 * 책임: 게임 상태 변경 사항을 실시간으로 클라이언트에 전파
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class GameStateServiceImpl implements GameStateService {
    private final WebSocketUtil webSocketUtil;
    private final GameRepository gameRepository; // 게임 상태 저장소

    @Override
    public void changeGamePhase(String roomId, GamePhase newPhase) {
        log.debug("Changing game phase for room {}: {}", roomId, newPhase);
        
        // 게임 상태 업데이트
        gameRepository.updateGamePhase(roomId, newPhase);
        
        // 상태 변경 메시지 생성
        GameStateUpdateMessage updateMessage = GameStateUpdateMessage.builder()
            .roomId(roomId)
            .phase(newPhase)
            .timestamp(LocalDateTime.now())
            .build();
            
        // 게임방 참가자들에게 상태 변경 알림
        webSocketUtil.sendToGame(roomId, newPhase, updateMessage);
        
        // 시스템 메시지 생성 및 전송
        String systemMessage = createSystemMessage(newPhase);
        webSocketUtil.sendToRoom(roomId, 
            new SystemMessage(roomId, systemMessage));
    }

    @Override
    public GamePhase getCurrentPhase(String roomId) {
        return gameRepository.getGamePhase(roomId);
    }

    @Override
    public void initializeGame(String roomId) {
        log.debug("Initializing game for room: {}", roomId);
        gameRepository.createGame(roomId);
        changeGamePhase(roomId, GamePhase.WAITING);
    }

    @Override
    public void endGame(String roomId) {
        log.debug("Ending game for room: {}", roomId);
        gameRepository.deleteGame(roomId);
        webSocketUtil.sendToRoom(roomId, 
            new SystemMessage(roomId, "게임이 종료되었습니다."));
    }

    private String createSystemMessage(GamePhase phase) {
        return switch (phase) {
            case DAY -> "새로운 아침이 밝았습니다. 토론을 시작하세요.";
            case NIGHT -> "밤이 되었습니다. 각자의 역할을 수행하세요.";
            case VOTE -> "투표 시간입니다. 의심가는 사람을 지목하세요.";
            case FINAL_VOTE -> "최후 변론 시간입니다.";
            default -> "게임 단계가 변경되었습니다.";
        };
    }
}