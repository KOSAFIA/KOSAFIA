package com.kosafia.gameapp.services.gameState;

import com.kosafia.gameapp.models.socketenum.GamePhase;

/**
 * 게임 상태 관리 기능을 정의하는 인터페이스
 */
public interface GameStateService {
    void changeGamePhase(String roomId, GamePhase newPhase);
    GamePhase getCurrentPhase(String roomId);
    void initializeGame(String roomId);
    void endGame(String roomId);
}