package com.kosafia.gameapp.models.gameroom;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GameRoomDto {

    private Long roomId;
    private String roomName;
    private int maxPlayers;
    private int currentPlayers;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
    private String roomStatus;
    private String roomPassword; // 비밀번호 추가

    // Constructor
    public GameRoomDto() {}

    public GameRoomDto(GameRoom gameRoom) {
        this.roomId = gameRoom.getRoomId();
        this.roomName = gameRoom.getRoomName();
        this.maxPlayers = gameRoom.getMaxPlayers();
        this.currentPlayers = gameRoom.getCurrentPlayers();
        this.isPrivate = gameRoom.isPrivate();
        this.roomStatus = gameRoom.getRoomStatus();
        this.roomPassword = gameRoom.getRoomPassword(); // 비밀번호 설정
    }

     // Convert DTO to Entity
     public GameRoom toEntity() {
        GameRoom gameRoom = new GameRoom();
        gameRoom.setRoomId(this.roomId);
        gameRoom.setRoomName(this.roomName);
        gameRoom.setMaxPlayers(this.maxPlayers);
        gameRoom.setCurrentPlayers(this.currentPlayers);
        gameRoom.setPrivate(this.isPrivate);
        gameRoom.setRoomStatus(this.roomStatus);
        gameRoom.setRoomPassword(this.roomPassword); // 비밀번호 설정
        return gameRoom;
    }

    
}
