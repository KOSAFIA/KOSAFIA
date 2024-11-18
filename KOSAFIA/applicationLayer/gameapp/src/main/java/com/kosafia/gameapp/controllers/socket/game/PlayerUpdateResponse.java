package com.kosafia.gameapp.controllers.socket.game;

import lombok.Builder;
import java.util.List;

import com.kosafia.gameapp.models.gameroom.Player;


@Builder
public record PlayerUpdateResponse(
    String gameStatus,
    List<Player> players,
    boolean success,
    String message
) {}    