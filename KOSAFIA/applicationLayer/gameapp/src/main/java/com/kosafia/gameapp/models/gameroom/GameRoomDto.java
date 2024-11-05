package com.kosafia.gameapp.models.gameroom;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kosafia.gameapp.models.user.User;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
// @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, 
// include = JsonTypeInfo.As.PROPERTY, 
// property = "@class")
public class GameRoomDto {

    private Long roomId;
    private String roomName;
    private int maxPlayers;
    private int currentPlayers;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
    private String roomStatus;
    private String roomPassword; // 비밀번호 추가
    private List<User> users;


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
        // this.usersId = gameRoom.getUsersId();
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
        // gameRoom.setUsersId(this.usersId);
        return gameRoom;
    }

    
}
