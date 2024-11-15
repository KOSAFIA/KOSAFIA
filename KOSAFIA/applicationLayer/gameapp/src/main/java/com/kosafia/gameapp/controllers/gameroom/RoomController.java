package com.kosafia.gameapp.controllers.gameroom;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;
import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.models.user.UserData;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;
import com.kosafia.gameapp.services.gameroom.RoomService;
import com.kosafia.gameapp.services.user.UserService;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    @Autowired
    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    record RoomDetails(String roomName, int maxPlayers, boolean isPrivate, String password) {
    }

    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody RoomDetails roomDetails,
            HttpSession session) {
        // 세션에서 유저 정보를 가져옴
        System.out.println("방 생성 요청 - 유저 정보 확인");
        UserData userData = roomService.getUserDataFromSession(session);

        if (userData == null) {
            System.out.println("유저 정보가 없습니다 - 로그인 필요");
            return ResponseEntity.status(401).body(null);
            // return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        // 방 생성 및 플레이어 입장
        System.out.println("방 생성 중 - 입력된 정보: 방 제목=" + roomDetails.roomName + ", 최대 인원=" + roomDetails.maxPlayers
                + ", 비밀번호=" + roomDetails.password + ", 비밀방 여부=" + roomDetails.isPrivate);

        // Player player = roomService.joinRoom(room.getRoomKey(), userData);
        Room room = roomService.createRoom(roomDetails.roomName, roomDetails.maxPlayers, roomDetails.password,
                roomDetails.isPrivate, userData);
        Integer roomKey = room.getRoomKey();
        System.out.println("방 생성 완료 - 방 키=" + roomKey);

        // if (player != null) {
        // // 세션에 플레이어와 방 정보를 저장
        // session.setAttribute("player", player);
        // session.setAttribute("roomKey", room.getRoomKey()); // 방의 roomKey를 세션에 저장
        // return ResponseEntity.ok(player); // 생성된 방에 입장한 플레이어 정보 반환
        // } else {
        // return ResponseEntity.status(409).body(null); // 입장 불가능한 경우
        // }

        // return ResponseEntity.ok("방이 생성되었습니다: Room ID " + room.getRoomKey());

        // 비밀번호 정보 생성
        Map<String, String> passwordMap = new HashMap<>();
        passwordMap.put("password", roomDetails.password); // 비밀번호 정보 설정

        return joinRoom(roomKey, passwordMap, session);
    }

    // 방 입장 엔드포인트
    @PostMapping("/{roomKey}/join")
    public ResponseEntity<?> joinRoom(@PathVariable("roomKey") Integer roomKey,
            @RequestBody Map<String, String> passwordMap, HttpSession session) {
        log.info("방 입장 요청 - roomKey: {}", roomKey);

        try {
            String password = passwordMap.get("password");
            // 1. 세션에서 유저 정보 확인
            UserData userData = roomService.getUserDataFromSession(session);
            if (userData == null) {
                log.warn("인증되지 않은 사용자의 방 입장 시도");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "로그인이 필요합니다."));
            }

            // 2. 방 존재 여부 확인
            Room room = roomService.getRoomById(roomKey);
            if (room == null) {
                log.warn("존재하지 않는 방 입장 시도 - roomKey: {}", roomKey);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "존재하지 않는 방입니다."));
            }

            // 3. 비밀방 비밀번호 검증 (비밀방일 경우)
            boolean isAuthorized = roomService.validateRoomPassword(roomKey, password);
            if (!isAuthorized) {
                // return ResponseEntity.status(403).body("비밀번호가 일치하지 않습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "비밀번호가 일치하지 않습니다."));
            }

            // 김남영 수정
            // 4. 방 입장 가능 여부 확인
            if (room.getMaxPlayers() <= room.getCurrentPlayers() || room.getGameStatus() != GameStatus.NONE) {
                log.warn("입장 불가능한 방 - roomKey: {}, 현재 인원: {}/{}",
                        roomKey, room.getPlayers().size(), room.getMaxPlayers());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "방이 가득 찼거나 게임이 진행 중입니다."));
            }

            // 김남영 수정
            // 5. 중복 입장 확인
            if (room.getPlayerByUserEmail(userData.getUserEmail()) != null) {
                log.warn("이미 방에 있는 플레이어의 재입장 시도 - username: {}", userData.getUsername());
                Player existingPlayer = room.getPlayerByUserEmail(userData.getUserEmail());
                session.setAttribute("player", existingPlayer);
                session.setAttribute("roomKey", roomKey);

                return ResponseEntity.ok(Map.of(
                        "player", existingPlayer,
                        "roomKey", roomKey,
                        "message", "이미 방에 입장해 있습니다."));
            }

            // 6. 새로운 플레이어 생성 및 방 입장
            Player newPlayer = roomService.joinRoom(roomKey, userData);
            if (newPlayer == null) {
                log.error("플레이어 생성 실패 - username: {}", userData.getUsername());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "플레이어 생성에 실패했습니다."));
            }

            // 7. 세션에 정보 저장
            session.setAttribute("player", newPlayer);
            session.setAttribute("roomKey", roomKey);

            // 8. 성공 응답
            Map<String, Object> response = new HashMap<>();
            response.put("player", newPlayer);
            response.put("roomKey", roomKey);
            response.put("message", "방 입장에 성공했습니다.");

            log.info("방 입장 성공 - username: {}, roomKey: {}", userData.getUsername(), roomKey);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("방 입장 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "서버 오류가 발생했습니다."));
        }
    }

    @PostMapping("/{roomKey}/leave")
    public ResponseEntity<String> leaveRoom(@PathVariable("roomKey") Integer roomKey, HttpSession session) {
        // 1. 세션에서 플레이어 정보 가져오기
        Player player = (Player) session.getAttribute("player");
        if (player == null) {
            log.warn("로그아웃된 상태이거나 플레이어 정보가 세션에 없습니다. roomKey: {}", roomKey);
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        log.info("플레이어가 방을 나가려 합니다. roomKey: {}, player: {}", roomKey, player.getUsername());

        // 2. 방에서 플레이어 제거 요청
        boolean removed = roomService.leaveRoom(roomKey, player);
        if (removed) {
            log.info("플레이어가 방에서 성공적으로 나갔습니다. roomKey: {}, player: {}", roomKey, player.getUsername());
            // log.info("방에 남은 플레이어들 : {}", roomService.getRoomById(roomKey).getPlayers());

            // 3. 세션에서 플레이어와 방 정보 삭제
            session.removeAttribute("player");
            session.removeAttribute("roomKey");
            log.info("세션에서 플레이어 정보와 방 정보를 제거했습니다. player: {}, roomKey: {}", player.getUsername(), roomKey);

            return ResponseEntity.ok("방에서 성공적으로 나갔습니다.");
        } else {
            log.warn("플레이어를 방에서 제거하는 데 실패했습니다. roomKey: {}, player: {}", roomKey, player.getUsername());

            log.info("방에 남은 플레이어들 : {}", roomService.getRoomById(roomKey).getPlayers());

            return ResponseEntity.status(404).body("방을 나가는 데 실패했습니다.");
        }
    }

    // 게임 시작 엔드포인트 그런데 방에집중한!! 반환값은 여러개가 있지만 성공하면 데이터로 플레이어값 나갈거야
    @PostMapping("/{roomKey}/start")
    public ResponseEntity<?> startGame(@PathVariable("roomKey") Integer roomKey, HttpSession session) {
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

            // 4. 김남영 테스트용 시작 나중에 날려도 됨.
            Random random = new Random();
            room.getPlayers().forEach(player -> {
                int randomNumber = random.nextInt(1, 5);
                System.out.println(player.getUsername());
                // 플레이어 랜덤으로 직업 지정
                player.setRole(Role.values()[randomNumber]);
            });

            // 5. 방 상태 변경 : 로직내용은 턴=1 세팅 게임 진행중 상태 세팅

            if (room.startGame()) {
                log.info("방 {}에서 게임이 시작되었어요!", roomKey);
            } else {
                log.warn("방 {}에서 게임이 이미 진행중이에요!", roomKey);
            }

            log.info("방 {} 게임 시작! 상태: {}", roomKey, room.getGameStatus());

            return ResponseEntity.ok(room); // 방 전체 정보 반환
        } catch (Exception e) {
            log.error("게임 시작 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 게임 종료 엔드포인트
    @PostMapping("/{roomKey}/end")
    public ResponseEntity<String> endGame(@PathVariable("roomKey") Integer roomKey) {
        roomService.endGame(roomKey);
        return ResponseEntity.ok("게임이 종료되었습니다.");
    }

    // 방 삭제 엔드포인트
    @DeleteMapping("/{roomKey}/delete")
    public ResponseEntity<String> deleteRoom(@PathVariable("roomKey") Integer roomKey) {
        roomService.deleteRoom(roomKey);
        return ResponseEntity.ok("방이 삭제되었습니다.");
    }

    // 특정 방 조회
    @GetMapping("/{roomKey}")
    public ResponseEntity<Room> getRoomById(@PathVariable("roomKey") Integer roomKey) {
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
