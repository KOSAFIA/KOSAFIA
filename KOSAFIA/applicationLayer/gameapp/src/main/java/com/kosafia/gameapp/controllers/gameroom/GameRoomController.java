package com.kosafia.gameapp.controllers.gameroom;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.models.gameroom.GameRoomDto;
import com.kosafia.gameapp.services.gameroom.GameRoomService;

@RestController
@RequestMapping("/api/rooms")
public class GameRoomController {
    @Autowired
    private GameRoomService gameRoomService;

    @PostMapping
    public ResponseEntity<GameRoomDto> createRoom(@RequestBody GameRoomDto gameRoomDto, @RequestParam Long creatorId) {
        GameRoomDto createdRoom = gameRoomService.createRoom(gameRoomDto, creatorId);
        return ResponseEntity.ok(createdRoom);
    }

    // 아이디 조회
    @GetMapping("/{roomId}")
    public ResponseEntity<GameRoomDto> getRoomById(@PathVariable Long roomId) {
        GameRoomDto room = gameRoomService.getRoomById(roomId);
        return room != null ? ResponseEntity.ok(room) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
        gameRoomService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    // 전체 조회
    @GetMapping
    public ResponseEntity<List<GameRoomDto>> getAllRooms() {
        List<GameRoomDto> rooms = gameRoomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }

    // 검색어 조회
    @GetMapping("/search")
    public ResponseEntity<List<GameRoomDto>> getRoomsBySearch(@RequestParam String searchKeyword) {
        List<GameRoomDto> rooms = gameRoomService.getRoomsBySearch(searchKeyword);
        return ResponseEntity.ok(rooms);
    }

    // 대기방 조회
    @GetMapping("/waiting")
    public ResponseEntity<List<GameRoomDto>> getWaitingRooms() {
        List<GameRoomDto> rooms = gameRoomService.getWaitingRooms();
        return ResponseEntity.ok(rooms);
    }

}