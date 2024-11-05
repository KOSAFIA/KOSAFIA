package com.kosafia.gameapp.knytestset;

import java.util.*;

import com.kosafia.gameapp.models.user.*;

import lombok.*;

@Data
@Builder
public class Room {
    private String roomId;
    private String name;
    private Set<User> users;
    private int maxUsers;
    private RoomStatus status;
    
    public enum RoomStatus {
        WAITING,    // Waiting for players
        PLAYING     // Game in progress
    }
    
    // Add user to room
    public boolean addUser(User user) {
        if (users.size() >= maxUsers) {
            return false;
        }
        return users.add(user);
    }
    
    // Remove user from room
    public boolean removeUser(User user) {
        return users.remove(user);
    }
    
    // Check if room is full
    public boolean isFull() {
        return users.size() >= maxUsers;
    }
}
