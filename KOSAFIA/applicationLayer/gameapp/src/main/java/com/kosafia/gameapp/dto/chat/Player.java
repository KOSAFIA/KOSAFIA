package com.kosafia.gameapp.dto.chat;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Player {
    private String playerId;
    private String username;
    private GameRole role;
    private boolean isAlive;
}
