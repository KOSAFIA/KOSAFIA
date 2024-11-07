package com.kosafia.gameapp.services.game;

import java.util.ArrayList;

import com.kosafia.gameapp.models.game.Player;

public interface GameService {

    // 역할 부여
    void assignRoles(ArrayList<Player> players);
}
