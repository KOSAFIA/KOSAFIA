package com.kosafia.gameapp.knytestset;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class RoomRepositoryKny {
    private final Map<String, Room> rooms = new ConcurrentHashMap<>();
    
    public Room save(Room room) {
        rooms.put(room.getRoomId(), room);
        return room;
    }
    
    public Optional<Room> findById(String roomId) {
        return Optional.ofNullable(rooms.get(roomId));
    }
    
    public List<Room> findAll() {
        return new ArrayList<>(rooms.values());
    }
    
    public void remove(String roomId) {
        rooms.remove(roomId);
    }
    
    public boolean exists(String roomId) {
        return rooms.containsKey(roomId);
    }
    
    // Find room by user
    public Optional<Room> findByUser(User user) {
        return rooms.values().stream()
                .filter(room -> room.getUsers().contains(user))
                .findFirst();
    }
}
