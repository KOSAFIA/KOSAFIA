package com.kosafia.gameapp.services.gameState;

import com.kosafia.gameapp.models.gameState.GameConstants.GamePhase;
import com.kosafia.gameapp.models.gameState.GameConstants.GameRole;

/**
 * 게임 상태 관리를 위한 인터페이스
 * 게임방의 현재 상태와 플레이어들의 역할 정보를 관리
 */
public interface GameStateService {
    /**
     * 특정 게임방의 현재 게임 단계를 조회
     * @param roomId 게임방 ID
     * @return 현재 게임 단계
     */
    GamePhase getCurrentPhase(String roomId);

    /**
     * 특정 사용자의 게임 역할을 조회
     * @param roomId 게임방 ID
     * @param userId 사용자 ID
     * @return 사용자의 게임 역할
     */
    GameRole getUserRole(String roomId, String userId);

    /**
     * 게임방의 게임 단계를 업데이트
     * @param roomId 게임방 ID
     * @param phase 변경할 게임 단계
     */
    void updateGamePhase(String roomId, GamePhase phase);

    /**
     * 사용자에게 게임 역할을 할당
     * @param roomId 게임방 ID
     * @param userId 사용자 ID
     * @param role 할당할 역할
     */
    void assignUserRole(String roomId, String userId, GameRole role);
}