package com.kosafia.gameapp.dto.chat.room;

import java.util.List;

import com.kosafia.gameapp.knytestset.Room.RoomStatus;
import com.kosafia.gameapp.models.user.User;

import lombok.*;

@Data
@Builder
public class RoomJoinResponse {
    private String roomId;
    private String roomName;
    private int currentUsers;
    private int maxUsers;
    private RoomStatus status;
    private List<User> users;
}