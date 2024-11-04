package com.kosafia.gameapp.controllers.socket;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.dto.chat.GameExceptionHandler.ErrorResponse;

import lombok.extern.slf4j.Slf4j;

import com.kosafia.gameapp.dto.chat.GameSession;
import com.kosafia.gameapp.dto.chat.GameSessionService;
import com.kosafia.gameapp.dto.chat.GameStateUpdateRequest;
import com.kosafia.gameapp.dto.chat.JoinGameRequest;
import com.kosafia.gameapp.dto.chat.PlayerStateUpdateRequest;

@Slf4j
@RestController
@RequestMapping("/api/game")
public class GameController {
    
    private final GameSessionService gameSessionService;

    @Autowired
    public GameController(GameSessionService gameSessionService) {
        this.gameSessionService = gameSessionService;
    }

    // 게임 세션 생성/참여
    @PostMapping("/join")
    public ResponseEntity<GameSession> joinGame(
        @RequestBody JoinGameRequest request
    ) {
        log.info("api/game/join 안으로 들어왔어 사용값은 순서대로 request.getSessionId(),\r\n" + //
                        "request.getPlayerId(),\r\n" + //
                        "request.getRole(): " + request.getSessionId() + request.getPlayerId() + request.getRole());

        GameSession session = gameSessionService.joinSession(
            request.getSessionId(),
            request.getPlayerId(),
            request.getRole()
        );
        return ResponseEntity.ok(session);
    }

    // 게임 상태 변경
    @PostMapping("/state")
    public ResponseEntity<Void> updateGameState(
        @RequestBody GameStateUpdateRequest request
    ) {
        gameSessionService.updateGameState(
            request.getSessionId(),
            request.getNewState()
        );
        return ResponseEntity.ok().build();
    }

    // 플레이어 상태 변경
    @PostMapping("/player/state")
    public ResponseEntity<Void> updatePlayerState(
        @RequestBody PlayerStateUpdateRequest request
    ) {
        gameSessionService.updatePlayerState(
            request.getSessionId(),
            request.getPlayerId(),
            request.isAlive()
        );
        return ResponseEntity.ok().build();
    }

    // 최후변론자 설정 엔드포인트
    @PostMapping("/finalvote")
    public ResponseEntity<?> setFinalVoteTarget(
        @RequestBody Map<String, String> request
    ) {
        try {
            String sessionId = request.get("sessionId");
            String targetId = request.get("targetId");
            
            gameSessionService.setFinalVoteTarget(sessionId, targetId);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity
                .badRequest()
                .body(new ErrorResponse("최후변론자 설정에 실패했습니다: " + e.getMessage()));
        }
    }

}
