package com.kosafia.gameapp.controllers.socket.game;
import lombok.*;

@Builder
public record MafiaTargetMessage(
    Integer mafiaId, 
    Integer targetId, 
    Integer roomKey
) {}
