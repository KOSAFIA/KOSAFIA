package com.kosafia.gameapp.controllers.gameroom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.repositories.gameroom.RoomRepository;
import com.kosafia.gameapp.services.room.RoomJoinService;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/rooms")
public class RoomController {

    private final RoomRepository roomRepository;
    private RoomJoinService roomJoinService;

    @Autowired
    public RoomController(RoomRepository roomRepository, RoomJoinService roomJoinService) {
        this.roomRepository = roomRepository;
        this.roomJoinService = roomJoinService;
    }

    // 사용자가 방에 입장하는 API
    @PostMapping("/{roomId}/join")
    public ResponseEntity<String> joinRoom(@PathVariable Integer roomId, HttpSession session) {
        log.info("18"+roomId);
        return roomJoinService.joinRoom(roomId, session);
    }

}
