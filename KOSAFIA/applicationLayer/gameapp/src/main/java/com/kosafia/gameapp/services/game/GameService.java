package com.kosafia.gameapp.services.game;

import java.util.List;

import org.springframework.stereotype.Service;

import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;

@Service
public interface GameService {

    public void interactionBroadcastGameStatus(Integer roomKey, String interactionImageUrl);

    public void stageBroadcastGameStatus(Integer roomKey, String stageImageUrl);

    public void endingBroadcastGameStatus(Integer roomKey, String endingImageUrl);

    public String checkGameEnd(List<Player> players, Integer roomKey);

    // 역할 상호작용 결과
    public void handleNightActions(List<Player> players, Integer roomKey);

    // ===============김남영 추가=============
    public void broadcastGameStatus(Integer roomKey, GameStatus gameStatus, List<Player> players);

    public void broadcastPlayerUpdate(Integer roomKey, List<Player> players);
    // =========================================
}