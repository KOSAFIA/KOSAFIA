package com.kosafia.gameapp.controllers.socket.game;

import lombok.Builder;

@Builder
public record TimerResponse(
    Integer time,
    String gameStatus,
    boolean success,
    String message
) {}
