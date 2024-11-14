package com.kosafia.gameapp.services.game;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;

public interface GameService {

    // 역할 부여
    void assignRoles(ArrayList<Player> players);

    // 마피아 상호작용
    boolean mafiaSelectTarget(List<Player> players, Integer targetNumber);

    // 의사 상호작용
    boolean doctorSavePlayer(List<Player> players, Integer targetNumber);

    // 경찰 상호작용
    Role policeCheckRole(List<Player> players, Integer targetNumber);

    // 밤 상호작용 정리
    void nightActionResult(List<Player> players);
}
