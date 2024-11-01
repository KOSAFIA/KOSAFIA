package com.kosafia.gameapp.dao.kny;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class GameRoom {
    private Long roomId;
    private Long creatorId;
    private String roomName;
    private int maxPlayers;
    private int currentPlayers;
    private boolean isPrivate;
    private String roomPassword;
    private String roomStatus;
    private LocalDateTime createdAt;
}