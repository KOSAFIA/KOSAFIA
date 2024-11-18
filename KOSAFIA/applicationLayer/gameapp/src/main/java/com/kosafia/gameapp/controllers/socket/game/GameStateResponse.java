package com.kosafia.gameapp.controllers.socket.game;

import lombok.Builder;
import java.util.List;
import com.kosafia.gameapp.models.gameroom.Player;

@Builder
public record GameStateResponse(
    String gameStatus,
    List<Player> players,
    int currentTime,
    int turn,
    boolean success,
    String message
) {}
