package com.kosafia.gameapp.services.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.kosafia.gameapp.models.game.Player;
import com.kosafia.gameapp.models.game.Role;

@Service
public class GameServiceImpl implements GameService {
    // 후에 인원수에 맞게 역할 분담 로직 필요할듯
    private static final Role[] ROLES = {
            Role.MAFIA,
            Role.DOCTOR,
            Role.POLICE,
            Role.CITIZEN,
            Role.CITIZEN,
            Role.CITIZEN,
            Role.CITIZEN,
            Role.CITIZEN
    };

    @Override
    public void assignRoles(ArrayList<Player> players) {

        if (players == null || players.isEmpty()) {
            throw new IllegalArgumentException("Players list cannot be null or empty.");
        }

        ArrayList<Role> roles = new ArrayList<>(List.of(ROLES));
        Collections.shuffle(roles);

        for (int i = 0; i < players.size(); i++) {
            players.get(i).setRole(roles.get(i));
        }
    }
}
