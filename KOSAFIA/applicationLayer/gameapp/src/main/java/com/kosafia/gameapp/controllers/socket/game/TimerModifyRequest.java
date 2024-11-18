package com.kosafia.gameapp.controllers.socket.game;

import lombok.Builder;

@Builder
public record TimerModifyRequest(
    Integer playerNumber,
    int adjustment
) {}

