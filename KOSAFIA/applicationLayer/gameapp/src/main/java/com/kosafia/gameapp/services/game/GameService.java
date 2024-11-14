package com.kosafia.gameapp.services.game;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;

public interface GameService {

    // 역할 부여
    void assignRoles(ArrayList<Player> players);

    // 마피아 상호작용
    boolean mafiaSelectTarget(ArrayList<Player> players, Integer targetNumber);

    // 의사 상호작용
    boolean doctorSavePlayer(ArrayList<Player> players, Integer targetNumber);

    // 경찰 상호작용
    Role policeCheckRole(ArrayList<Player> players, Integer targetNumber);

    void nightActionResult(ArrayList<Player> players);

    // ===============김남영 추가=============
    public void broadcastGameStatus(Integer roomKey, GameStatus gameStatus, List<Player> players);

    public void broadcastPlayerUpdate(Integer roomKey, List<Player> players);
    // =========================================
}
