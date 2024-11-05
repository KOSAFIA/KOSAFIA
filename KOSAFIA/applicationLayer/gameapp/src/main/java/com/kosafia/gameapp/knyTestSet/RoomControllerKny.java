package com.kosafia.gameapp.knytestset;

import java.util.*;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.kosafia.gameapp.knytestset.Room.RoomStatus;
import com.kosafia.gameapp.models.user.User;

import lombok.*;
import lombok.extern.slf4j.*;

// RoomControllerKny.java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
@Slf4j
public class RoomControllerKny {
    private final RoomServiceKny roomService;
    
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }
    
    @PostMapping("/{roomId}/join")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId, @RequestParam Long userId) {
        try {
            Room room = roomService.joinRoom(roomId, userId);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            log.error("방 입장 중 오류 발생", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<?> leaveRoom(
            @PathVariable String roomId,
            @RequestBody User user) {
        try {
            Room room = roomService.leaveRoom(roomId, user);
            return ResponseEntity.ok(room);
        } catch (RuntimeException e) {
            log.error("Error leaving room: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{roomId}/users")
    public ResponseEntity<Set<User>> getRoomUsers(@PathVariable String roomId) {
        try {
            Set<User> users = roomService.getRoomUsers(roomId);
            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            log.error("Error getting room users: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{roomId}/status")
    public ResponseEntity<?> getRoomStatus(@PathVariable String roomId) {
        try {
            RoomStatus status = roomService.getRoomStatus(roomId);
            return ResponseEntity.ok(Collections.singletonMap("status", status));
        } catch (RuntimeException e) {
            log.error("Error getting room status: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
