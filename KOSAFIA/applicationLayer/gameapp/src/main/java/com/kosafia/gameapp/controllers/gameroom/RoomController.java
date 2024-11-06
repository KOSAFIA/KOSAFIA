package com.kosafia.gameapp.controllers.gameroom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.models.user.UserData;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;
import com.kosafia.gameapp.services.room.RoomJoinService;
import com.kosafia.gameapp.services.user.UserService;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRepository roomRepository;
    private RoomJoinService roomJoinService;
    private UserService userService;

    @Autowired
    public RoomController(RoomRepository roomRepository, RoomJoinService roomJoinService, UserService userService ) {
        this.roomRepository = roomRepository;
        this.roomJoinService = roomJoinService;
        this.userService = userService;
    }

    // 사용자가 방에 입장하는 API
    @PostMapping("/{roomId}/join")
    public ResponseEntity<String> joinRoom(@PathVariable Integer roomId, HttpSession session) {
        log.info("controller"+roomId);
        log.info(roomRepository.getAllRooms().toString());
        log.info(roomRepository.getRoom(roomId).getUsers().toString());
        UserData userData = userService.getUserData(session);
        return roomJoinService.joinRoom(roomId, userData);
    }

}
