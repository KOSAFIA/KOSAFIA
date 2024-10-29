package com.kosafia.gameapp.repositories.kny;


import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Repository;

import com.kosafia.gameapp.models.socketenum.GamePhase;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 게임방의 상태를 메모리에 저장하고 관리하는 Repository
 * 실제 프로덕션에서는 Redis나 DB를 사용하는 것을 권장
 */
@Repository
@Slf4j
public class GameRepository {
    // 게임방 ID를 키로 하고 게임 페이즈를 값으로 저장하는 맵
    private final Map<String, GamePhase> gamePhases = new ConcurrentHashMap<>();

    /**
     * 게임방의 현재 페이즈 조회
     */
    public GamePhase getGamePhase(String roomId) {
        return gamePhases.getOrDefault(roomId, GamePhase.WAITING);
    }

    /**
     * 게임방의 페이즈 업데이트
     */
    public void updateGamePhase(String roomId, GamePhase phase) {
        gamePhases.put(roomId, phase);
        log.debug("Updated game phase for room {}: {}", roomId, phase);
    }

    /**
     * 새로운 게임방 생성
     */
    public void createGame(String roomId) {
        gamePhases.put(roomId, GamePhase.WAITING);
        log.debug("Created new game room: {}", roomId);
    }

    /**
     * 게임방 삭제
     */
    public void deleteGame(String roomId) {
        gamePhases.remove(roomId);
        log.debug("Deleted game room: {}", roomId);
    }
}