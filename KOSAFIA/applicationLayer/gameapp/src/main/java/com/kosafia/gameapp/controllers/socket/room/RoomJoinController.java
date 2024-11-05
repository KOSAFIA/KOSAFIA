package com.kosafia.gameapp.controllers.socket.room;

import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;

import com.kosafia.gameapp.dto.chat.room.RoomJoinResponse;
import com.kosafia.gameapp.knytestset.RoomServiceKny;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// controller/RoomJoinController.java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
@Slf4j
public class RoomJoinController {
    private final RoomServiceKny roomService;
    private final SimpMessageSendingOperations messagingTemplate;

    @PostMapping("/{roomId}/join")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId, @RequestParam Long userId) {
        log.info("Room join request - roomId: {}, userId: {}", roomId, userId);
        try {
            RoomJoinResponse response = roomService.joinRoom(roomId, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e);
        }
    }
}
