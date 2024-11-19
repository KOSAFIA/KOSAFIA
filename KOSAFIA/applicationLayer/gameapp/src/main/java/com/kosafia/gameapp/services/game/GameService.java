package com.kosafia.gameapp.services.game;

import java.util.ArrayList;
import java.util.List;

import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;

public interface GameService {

    // 역할 상호작용 결과
    void handleNightActions(List<Player> players, Integer roomKey);

    // ===============김남영 추가=============
    public void broadcastGameStatus(Integer roomKey, GameStatus gameStatus, List<Player> players);

    public void broadcastPlayerUpdate(Integer roomKey, List<Player> players);
    // =========================================
}
