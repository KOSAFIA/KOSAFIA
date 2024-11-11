package com.kosafia.gameapp.services.game;

import java.util.ArrayList;
import java.util.Optional;

import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;

public interface GameService {

    // 역할 부여
    void assignRoles(ArrayList<Player> players);

    boolean mafiaSelectTarget(ArrayList<Player> players, Integer targetNumber);

    boolean doctorSavePlayer(ArrayList<Player> players, Integer saveTargetNumber);

    Role policeCheckRole(ArrayList<Player> players, Integer checkTargetNumber);

    void nightActionResult(ArrayList<Player> players);
}
