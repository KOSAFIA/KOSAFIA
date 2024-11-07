package com.kosafia.gameapp.dto.chat;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.time.LocalDateTime;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kosafia.gameapp.dto.chat.GameChatMessage.MessageType;

import lombok.extern.slf4j.Slf4j;
@Service @Slf4j
public class GameSessionService {
    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public GameSessionService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // 채팅 가능 여부 확인 메서드 추가
    public boolean canChat(String sessionId, String playerId) {
        GameSession session = getSession(sessionId);
        Player player = session.getPlayers().get(playerId);
        
        if (!player.isAlive()) {
            return false;
        }

        switch (session.getGameState()) {
            case VOTE:
                return false;  // 투표 시간에는 모두 채팅 불가
                
            case FINAL_VOTE:
                // 최후 변론 대상자만 채팅 가능
                return session.getFinalVoteTarget() != null && 
                       session.getFinalVoteTarget().equals(playerId);
                
            case NIGHT:
                // 밤에는 마피아만 채팅 가능
                return player.getRole() == GameRole.MAFIA;
                
            case DAY:
                return true;  // 낮에는 생존자 모두 채팅 가능
                
            default:
                return false;
        }
    }    

        // 최후 변론 대상자 설정
        public void setFinalVoteTarget(String sessionId, String targetPlayerId) {
            GameSession session = getSession(sessionId);
            session.setFinalVoteTarget(targetPlayerId);
            
            // 상태 변경 및 알림
            updateGameState(sessionId, GameState.FINAL_VOTE);
            
            // 시스템 메시지로 최후 변론 대상자 알림
            Player targetPlayer = session.getPlayers().get(targetPlayerId);
            String message = String.format("플레이어 %s님이 최후 변론 대상자로 지목되었습니다.", targetPlayer.getUsername());
            sendSystemMessage(sessionId, message);
        }

    // 게임 세션 생성 또는 참여
    
    public GameSession joinSession(String sessionId, String playerId, GameRole role) {
        log.info("Player {} joining session {} with role {}", playerId, sessionId, role);
        
        GameSession session = sessions.computeIfAbsent(sessionId, id -> {
            GameSession newSession = GameSession.builder()
                .sessionId(id)
                .gameState(GameState.DAY)
                .players(new ConcurrentHashMap<>())
                .chatHistory(new CopyOnWriteArrayList<>())
                .build();
            log.info("Created new game session: {}", id);
            return newSession;
        });

        // 이미 존재하는 플레이어인지 확인
        if (session.getPlayers().containsKey(playerId)) {
            throw new IllegalStateException("Player already exists in session: " + playerId);
        }

        // 역할 검증
        validateRoleAssignment(session, role);

        Player player = Player.builder()
            .playerId(playerId)
            .username(playerId)
            .role(role)
            .isAlive(true)
            .build();

        session.getPlayers().put(playerId, player);
        log.info("Added player {} to session {}. Current players: {}",  playerId, sessionId, session.getPlayers().size());
        
        // 참가자 목록 업데이트 브로드캐스트
        broadcastParticipants(sessionId);
        
        // 입장 시스템 메시지 전송
        sendSystemMessage(sessionId, String.format("플레이어 %s님이 입장하셨습니다.", playerId));

        return session;
    }

    // 게임 상태 변경
    
    public void updateGameState(String sessionId, GameState newState) {
        log.info("Updating game state for session {}: {}", sessionId, newState);
        
        GameSession session = getSession(sessionId);
        GameState oldState = session.getGameState();
        
        // 상태 전환 유효성 검사
        validateStateTransition(oldState, newState);
        
        session.setGameState(newState);
        
        // 상태 변경 알림
        GameStateUpdateMessage updateMessage = new GameStateUpdateMessage(sessionId, newState);
        messagingTemplate.convertAndSend("/topic/room." + sessionId + ".state", updateMessage);
        
        // 상태 변경 시스템 메시지
        String stateMessage = getStateChangeMessage(oldState, newState);
        sendSystemMessage(sessionId, stateMessage);
    }

    // 플레이어 상태 변경
    
    public void updatePlayerState(String sessionId, String playerId, boolean isAlive) {
        log.info("Updating player state for session {}, player {}: alive={}", 
                sessionId, playerId, isAlive);
        
        GameSession session = getSession(sessionId);
        Player player = getPlayer(session, playerId);
        
        boolean oldState = player.isAlive();
        if (oldState != isAlive) {
            player.setAlive(isAlive);
            
            // 상태 변경 알림
            PlayerStateUpdateMessage updateMessage = new PlayerStateUpdateMessage(
                sessionId, playerId, isAlive, LocalDateTime.now());
            messagingTemplate.convertAndSend("/topic/room." + sessionId + ".player", updateMessage);
            
            // 시스템 메시지
            String stateMessage = isAlive 
                ? String.format("플레이어 %s님이 부활했습니다.", playerId)
                : String.format("플레이어 %s님이 사망했습니다.", playerId);
            sendSystemMessage(sessionId, stateMessage);
            
            // 게임 종료 조건 체크
            checkGameEndCondition(session);
        }
    }

    // 채팅 메시지 저장 및 브로드캐스트
    
    public void handleChatMessage(String sessionId, GameChatMessage message) {
        GameSession session = getSession(sessionId);
        session.getChatHistory().add(message);
        
        // 필요한 경우 채팅 기록 크기 제한
        if (session.getChatHistory().size() > 1000) {
            session.getChatHistory().remove(0);
        }
    }

    // 플레이어 퇴장 처리
    
    public void playerLeave(String sessionId, String playerId) {
        GameSession session = getSession(sessionId);
        Player player = session.getPlayers().remove(playerId);
        
        if (player != null) {
            sendSystemMessage(sessionId, String.format("플레이어 %s님이 퇴장하셨습니다.", playerId));
            broadcastParticipants(sessionId);
            
            // 게임 종료 조건 체크
            if (session.getPlayers().isEmpty()) {
                endSession(sessionId);
            } else {
                checkGameEndCondition(session);
            }
        }
    }

    // 유틸리티 메소드들
    private void validateRoleAssignment(GameSession session, GameRole role) {
        long currentRoleCount = session.getPlayers().values().stream()
            .filter(p -> p.getRole() == role)
            .count();
            
        switch (role) {
            case MAFIA:
                if (currentRoleCount >= 2) 
                    throw new IllegalStateException("Maximum mafia count exceeded");
                break;
            case POLICE:
            case DOCTOR:
                if (currentRoleCount >= 1)
                    throw new IllegalStateException("Role " + role + " is already taken");
                break;
        }
    }

    private void validateStateTransition(GameState oldState, GameState newState) {
        // 상태 전환 규칙 검증
        if (oldState == newState) return;
        
        switch (oldState) {
            case DAY:
                if (newState != GameState.VOTE)
                    throw new InvalidGameStateException("Day can only transition to Vote");
                break;
            case VOTE:
                if (newState != GameState.FINAL_VOTE && newState != GameState.NIGHT)
                    throw new InvalidGameStateException("Vote can only transition to Final Vote or Night");
                break;
            case FINAL_VOTE:
                if (newState != GameState.NIGHT)
                    throw new InvalidGameStateException("Final Vote can only transition to Night");
                break;
            case NIGHT:
                if (newState != GameState.DAY)
                    throw new InvalidGameStateException("Night can only transition to Day");
                break;
        }
    }

    private void checkGameEndCondition(GameSession session) {
        long aliveCount = countAlivePlayers(session.getSessionId());
        long aliveMafiaCount = session.getPlayers().values().stream()
            .filter(p -> p.isAlive() && p.getRole() == GameRole.MAFIA)
            .count();
            
        if (aliveMafiaCount == 0) {
            sendSystemMessage(session.getSessionId(), "시민 팀이 승리했습니다!");
            endSession(session.getSessionId());
        } else if (aliveMafiaCount >= (aliveCount - aliveMafiaCount)) {
            sendSystemMessage(session.getSessionId(), "마피아 팀이 승리했습니다!");
            endSession(session.getSessionId());
        }
    }

    private void sendSystemMessage(String sessionId, String content) {
        GameChatMessage systemMessage = GameChatMessage.builder()
            .type(MessageType.SYSTEM)
            .sender("SYSTEM")
            .content(content)
            .timestamp(LocalDateTime.now().toString())
            .build();
            
        messagingTemplate.convertAndSend("/topic/room." + sessionId, systemMessage);
    }

    private void broadcastParticipants(String sessionId) {
        List<Player> players = getSessionPlayers(sessionId);
        messagingTemplate.convertAndSend(
            "/topic/room." + sessionId + ".participants",
            players
        );
    }

    private String getStateChangeMessage(GameState oldState, GameState newState) {
        return String.format("게임 상태가 %s에서 %s로 변경되었습니다.", 
            oldState.toString(), newState.toString());
    }

    private Player getPlayer(GameSession session, String playerId) {
        Player player = session.getPlayers().get(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found: " + playerId);
        }
        return player;
    }

        // 세션 조회
    public GameSession getSession(String sessionId) {
        log.info("Attempting to get session with ID: {}", sessionId);
        GameSession session = sessions.get(sessionId);
        if (session == null) {
            throw new GameSessionNotFoundException("Game session not found: " + sessionId);
        }
        return session;
    }

        // 세션 존재 여부 확인
        public boolean sessionExists(String sessionId) {
            return sessions.containsKey(sessionId);
        }
    
        // 플레이어가 특정 세션에 속해있는지 확인
        public boolean isPlayerInSession(String sessionId, String playerId) {
            GameSession session = sessions.get(sessionId);
            return session != null && session.getPlayers().containsKey(playerId);
        }
    
        // 해당 세션의 모든 플레이어 조회
        public List<Player> getSessionPlayers(String sessionId) {
            GameSession session = getSession(sessionId);
            return new ArrayList<>(session.getPlayers().values());
        }
    
        // 특정 역할의 플레이어 수 조회
        public long countPlayersByRole(String sessionId, GameRole role) {
            GameSession session = getSession(sessionId);
            return session.getPlayers().values().stream()
                .filter(p -> p.getRole() == role)
                .count();
        }
    
        // 생존한 플레이어 수 조회
        public long countAlivePlayers(String sessionId) {
            GameSession session = getSession(sessionId);
            return session.getPlayers().values().stream()
                .filter(Player::isAlive)
                .count();
        }
    
        // 세션 삭제 (게임 종료 시)
        public void endSession(String sessionId) {
            sessions.remove(sessionId);
            // 웹소켓으로 게임 종료 알림
            messagingTemplate.convertAndSend(
                "/topic/room." + sessionId + ".end",
                new GameEndMessage(sessionId, LocalDateTime.now())
            );
        }
    
        // 채팅 기록 조회
        public List<GameChatMessage> getChatHistory(String sessionId) {
            GameSession session = getSession(sessionId);
            return new ArrayList<>(session.getChatHistory());
        }
        
        public class GameSessionNotFoundException extends RuntimeException {
                public GameSessionNotFoundException(String message) {
                    super(message);
                }
            }
    public class InvalidGameStateException extends RuntimeException {
    public InvalidGameStateException(String message) {
        super(message);
    }
}

public class PlayerNotFoundException extends RuntimeException {
    public PlayerNotFoundException(String message) {
        super(message);
    }
}

            
}
// //커스텀 예외 클래스들
// class GameSessionNotFoundException extends RuntimeException {
//     public GameSessionNotFoundException(String message) {
//         super(message);
//     }
// }

// class InvalidGameStateException extends RuntimeException {
//     public InvalidGameStateException(String message) {
//         super(message);
//     }
// }

// class PlayerNotFoundException extends RuntimeException {
//     public PlayerNotFoundException(String message) {
//         super(message);
//     }
// }
