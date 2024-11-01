package com.kosafia.gameapp.models.gameroom;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonTypeInfo;

import lombok.Data;

@Data
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
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


