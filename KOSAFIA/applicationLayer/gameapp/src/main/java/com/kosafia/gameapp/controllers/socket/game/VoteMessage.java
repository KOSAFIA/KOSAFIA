package com.kosafia.gameapp.controllers.socket.game;

import lombok.*;

@Builder
public record VoteMessage(
    Integer voterId, 
    Integer targetId, 
    Integer roomKey
) {}