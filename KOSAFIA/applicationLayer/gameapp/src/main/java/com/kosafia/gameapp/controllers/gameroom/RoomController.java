package com.kosafia.gameapp.controllers.gameroom;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.models.user.UserData;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;
import com.kosafia.gameapp.services.room.RoomJoinService;
import com.kosafia.gameapp.services.room.RoomService;
import com.kosafia.gameapp.services.user.UserService;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    // private final RoomRepository roomRepository;
    // private RoomJoinService roomJoinService;
    // private UserService userService;

    // @Autowired
    // public RoomController(RoomRepository roomRepository, RoomJoinService roomJoinService, UserService userService ) {
    //     this.roomRepository = roomRepository;
    //     this.roomJoinService = roomJoinService;
    //     this.userService = userService;
    // }

    // // 사용자가 방에 입장하는 API
    // @PostMapping("/{roomId}/join")
    // public ResponseEntity<String> joinRoom(@PathVariable Integer roomId, HttpSession session) {
    //     log.info("controller"+roomId);
    //     log.info(roomRepository.getAllRooms().toString());
    //     log.info(roomRepository.getRoom(roomId).getUsers().toString());
    //     UserData userData = userService.getUserData(session);

    //     session.setAttribute("roomId", roomId);
    //     return roomJoinService.joinRoom(roomId, userData);
    // }

    //  // 방 정보 조회 엔드포인트 (GET /rooms/{roomId})
    // @GetMapping("/{roomId}")
    // public ResponseEntity<Room> getRoom(@PathVariable Integer roomId) {
    //     Room room = roomRepository.getRoom(roomId); // Room 조회 로직
    //     if (room != null) {
    //         return ResponseEntity.ok(room);
    //     } else {
    //         return ResponseEntity.status(404).body(null);
    //     }
    // }

    // // 게임 시작 엔드포인트 (POST /rooms/{roomId}/start)
    // @PostMapping("/{roomId}/start")
    // public ResponseEntity<String> startGame(@PathVariable Integer roomId) {
    //     // 게임 시작 로직 구현
    //     Room room = roomRepository.getRoom(roomId);
    //     if (room != null) {
    //         // 게임 시작 처리
    //         return ResponseEntity.ok("게임이 시작되었습니다.");
    //     } else {
    //         return ResponseEntity.status(404).body("방을 찾을 수 없습니다.");
    //     }
    // }

    private final RoomService roomService;

    @Autowired
    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // 방 생성 엔드포인트
    @PostMapping("/create")
    public ResponseEntity<String> createRoom(@RequestParam String roomName,
                                             @RequestParam String password,
                                             @RequestParam boolean isPrivate) {
        Room room = roomService.createRoom(roomName, password, isPrivate);
        return ResponseEntity.ok("방이 생성되었습니다: Room ID " + room.getRoomKey());
    }

    // 방 입장 엔드포인트
    @PostMapping("/{roomKey}/join")
    public ResponseEntity<Player> joinRoom(@PathVariable Integer roomKey, HttpSession session) {
        // 세션에서 유저 정보를 가져옴
        UserData userData = roomService.getUserDataFromSession(session);
        if (userData == null) {
            return ResponseEntity.status(401).body(null);
            // return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        // 방에 유저 입장 처리
        Player player = roomService.joinRoom(roomKey, userData);
        if (player.equals(null)) {
            session.setAttribute("player", player);
            session.setAttribute("roomKey", roomKey);
            return ResponseEntity.ok(player);
        } else {
            return ResponseEntity.status(409).body(null);
            // return ResponseEntity.status(409).body("방이 가득 찼거나 입장할 수 없습니다.");
        }
    }

    // 방에서 플레이어 나가기
    @PostMapping("/{roomKey}/leave")
    public ResponseEntity<String> leaveRoom(@PathVariable Integer roomKey,
                                            @RequestParam String username) {
        boolean success = roomService.leaveRoom(roomKey, username);
        if (success) {
            return ResponseEntity.ok(username + "님이 방에서 나갔습니다.");
        } else {
            return ResponseEntity.status(404).body("플레이어를 찾을 수 없거나 방에서 나갈 수 없습니다.");
        }
    }

  // 게임 시작 엔드포인트
    @PostMapping("/{roomKey}/start")
    public ResponseEntity<List<Player>> startGame(@PathVariable Integer roomKey, HttpSession session) {
        // 세션에서 유저 정보 확인
        UserData userData = roomService.getUserDataFromSession(session);
        if (userData == null) {
            return ResponseEntity.status(401).body(null); // 로그인된 유저가 아닌 경우
        }

        // 게임 시작 요청
        List<Player> players = roomService.startGame(roomKey, userData);
        if (players == null) {
            return ResponseEntity.status(403).body(null); // 방장만 시작 가능 또는 방이 없을 경우
        }

        return ResponseEntity.ok(players); // 방의 모든 플레이어 정보 반환
    }

    // 게임 종료 엔드포인트
    @PostMapping("/{roomKey}/end")
    public ResponseEntity<String> endGame(@PathVariable Integer roomKey) {
        roomService.endGame(roomKey);
        return ResponseEntity.ok("게임이 종료되었습니다.");
    }

    // 방 삭제 엔드포인트
    @DeleteMapping("/{roomKey}/delete")
    public ResponseEntity<String> deleteRoom(@PathVariable Integer roomKey) {
        roomService.deleteRoom(roomKey);
        return ResponseEntity.ok("방이 삭제되었습니다.");
    }

    // 특정 방 조회
    @GetMapping("/{roomKey}")
    public ResponseEntity<Room> getRoomById(@PathVariable Integer roomKey) {
        Room room = roomService.getRoomById(roomKey);
        if (room != null) {
            return ResponseEntity.ok(room);
        } else {
            return ResponseEntity.status(404).body(null);
        }
    }


    // 모든 방 조회
    @GetMapping("/all")
    public ResponseEntity<Map<Integer, Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }
}
