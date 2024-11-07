package com.kosafia.gameapp.models.socket;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class UserSessionRepository {
    // sessionId를 키로 사용하는 세션 저장소
    private final Map<String, UserSession> sessions = new ConcurrentHashMap<>();
    
    // userId로 세션을 조회하기 위한 매핑
    private final Map<String, String> userSessionMapping = new ConcurrentHashMap<>();
    
    public void save(UserSession session) {
        sessions.put(session.getSessionId(), session);
        userSessionMapping.put(Long.toString(session.getUser().getUserId()), session.getSessionId());
        log.debug("Session saved - sessionId(String): {}, userId(String): {}", 
                session.getSessionId(), session.getUser().getUserId());
    }
    
    public Optional<UserSession> findBySessionId(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }
    
    public Optional<UserSession> findByUserId(String userId) {
        String sessionId = userSessionMapping.get(userId);
        return Optional.ofNullable(sessionId)
                .map(sessions::get);
    }
    
    public void remove(String sessionId) {
        Optional.ofNullable(sessions.get(sessionId))
                .ifPresent(session -> {
                    userSessionMapping.remove(session.getUser().getUserId());
                    sessions.remove(sessionId);
                    log.debug("Session removed - sessionId: {}", sessionId);
                });
    }
    
    public List<UserSession> findAllByRoomId(String roomId) {
        return sessions.values().stream()
                .filter(session -> roomId.equals(session.getCurrentRoomId()))
                .collect(Collectors.toList());
    }
    
    public void updateUserRoom(String sessionId, String roomId) {
        findBySessionId(sessionId).ifPresent(session -> {
            session.setCurrentRoomId(roomId);
            save(session);
            log.debug("User room updated - sessionId: {}, roomId: {}", sessionId, roomId);
        });
    }
}
