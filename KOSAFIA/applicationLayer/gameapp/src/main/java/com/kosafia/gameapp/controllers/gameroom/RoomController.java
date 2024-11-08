package com.kosafia.gameapp.controllers.gameroom;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;
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

        // 방키로 유저 플레이어 리스트를 일단 접근 + 
        // 유저데이터로 플레이러를 만들어서 저장 + 
        // 그 플레이어를 사용할수 있게 반환
        Player player = roomService.joinRoom(roomKey, userData);
        if (!player.equals(null)) {
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
    public ResponseEntity<String> leaveRoom(@PathVariable Integer roomKey, HttpSession session) {
      // 세션에서 플레이어 정보 가져오기
      Player player = (Player) session.getAttribute("player");
      if (player == null) {
          return ResponseEntity.status(401).body("로그인이 필요합니다.");
      }
  
      // 방에서 플레이어 제거
      boolean removed = roomService.leaveRoom(roomKey, player);
      if (removed) {
          // 세션에서 플레이어와 방 정보 삭제
          session.removeAttribute("player");
          session.removeAttribute("roomKey");
          return ResponseEntity.ok("방에서 성공적으로 나갔습니다.");
      } else {
          return ResponseEntity.status(404).body("방을 나가는 데 실패했습니다.");
      }
    }

  // 게임 시작 엔드포인트 그런데 방에집중한!!  반환값은 여러개가 있지만 성공하면 데이터로 플레이어값 나갈거야
    @PostMapping("/{roomKey}/start")
    public ResponseEntity<?> startGame(@PathVariable Integer roomKey, HttpSession session) {
        log.info("방 {}에서 게임 시작 요청이 왔어요", roomKey);
        
        try {
            // 1. 세션에서 현재 플레이어 정보 확인
            Player currentPlayer = (Player) session.getAttribute("player");
            if (currentPlayer == null) {
                log.error("세션에서 플레이어 정보를 찾을 수 없어요");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("플레이어 정보가 없어요");
            }

            // 2. 방 존재 여부 및 상태 확인
            Room room = roomService.getRoomById(roomKey);
            if (room == null) {
                log.error("방 {}을 찾을 수 없어요", roomKey);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("방을 찾을 수 없어요");
            }

            // 3. 게임 시작 조건 체크
            if (room.getPlayers().size() < room.getMaxPlayers()) {
                log.warn("방 {}에 플레이어가 부족해요: {}/{}", roomKey, room.getPlayers().size(), room.getMaxPlayers());
                return ResponseEntity.badRequest().body("게임을 시작하려면 풀방이어야 해요");
            }

            ///****** 이부분 매우 중요 하은님이 개발한 현재 룸 랜덤 역할 배정 로직이 여기에 적용되어야함. */
            // 4. 플레이어 게임 상태로 변경 == 역할 배정 None에서 무언가로 지금은 가라로 다 Citizen 넣을게용
            currentPlayer.setRole(Role.CITIZEN);
            session.setAttribute("player", currentPlayer);  // 세션 업데이트
            
            // 5. 방 상태 변경 : 로직내용은 턴=1 세팅 게임 진행중 상태 세팅
            room.startGame();
            log.info("방 {}에서 게임이 시작되었어요!", roomKey);

            return ResponseEntity.ok(currentPlayer);  // 업데이트된 플레이어 정보 반환

        } catch (Exception e) {
            log.error("게임 시작 중 오류가 발생했어요", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("게임을 시작하는 중에 문제가 발생했어요: " + e.getMessage());
        }
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
