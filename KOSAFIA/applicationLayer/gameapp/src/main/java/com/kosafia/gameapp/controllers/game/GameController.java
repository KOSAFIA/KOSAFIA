package com.kosafia.gameapp.controllers.game;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;
import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;
import com.kosafia.gameapp.services.game.GameService;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/game")
@Slf4j
// @RequiredArgsConstructor
public class GameController {

    @Autowired
    private GameService gameService;

    @Autowired
    private RoomRepository roomRepository;

    @PostMapping("/update-targets-at-night")
    public ResponseEntity<Object> updatePlayerTargetAtNight(@RequestBody Map<String, Object> requestData,
            HttpSession session) {
        try {
            log.info("update-target-at-night 실행됨");
            Integer playerNumber = (Integer) requestData.get("playerNumber");
            Integer target = (Integer) requestData.get("target");

            if (playerNumber == null || target == null) {
                return ResponseEntity.badRequest().body("playerNumber 또는 target 값이 누락되었습니다.");
            }
            Player player = roomRepository.getRoom((Integer) session.getAttribute("roomKey"))
                    .getPlayerByPlayerNumber(playerNumber);
            player.setTarget(target);

            // 업데이트 로그
            System.out.println("Player " + playerNumber + "의 타겟이 " + target + "으로 설정되었습니다.");
            return ResponseEntity.ok(player);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류 발생");
        }
    }

    // 밤 단계 행동 처리 API
    @PostMapping("/handle-night-actions")
    public ResponseEntity<Object> handleNightActions(@RequestBody Map<String, Object> requestBody) {
        try {
            log.info("handle-night-actions 실행됨");
            Integer roomKey;
            try {
                roomKey = Integer.parseInt(requestBody.get("roomKey").toString());
            } catch (NumberFormatException e) {
                log.error("roomKey 변환 오류: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("roomKey 변환 오류");
            }

            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                return ResponseEntity.badRequest().body("방을 찾을 수 없습니다.");
            }

            // 게임 서비스의 handleNightActions 메서드 호출
            gameService.handleNightActions(room.getPlayers(), roomKey);

            // 플레이어 상태 리스트를 응답으로 반환
            return ResponseEntity.ok(room.getPlayers());
        } catch (Exception e) {
            log.error("밤 행동 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류발생");
        }
    }

    // PlayersUpdateResponse 레코드 추가
    record PlayersUpdateResponse(List<Player> players) {
    }

    // -----------------김남영 추가 시작 리스트-----------------
    // 1. 방장 지정
    // 2. 게임 상태 변경(관리자)
    // 3. 플레이어 상태 변경(관리자)
    // 4. 투표 결과 처리
    // 5. 최종 투표 결과 처리
    // 6. 현재 게임 상태 조회
    // -----------------김남영 추가 리스트 끝 -----------------

    // 현재 게임 상태를 가져오는 API
    @PostMapping("/current-data")
    public Map<String, Object> getGameData(HttpSession session, @RequestBody Map<String, Object> roomInfo) {
        Map<String, Object> gameData = new HashMap<>();

        // Integer roomKey = (Integer)roomInfo.get("roomKey");
        Integer roomKey = null;

        // 이 자식의 세션값에서 룸키 값 가져오기
        try {
            roomKey = (Integer) session.getAttribute("roomKey");
        } catch (Exception e) {
            System.out.println("방 키를 가져오는데 실패했어요: " + e.getMessage());
            throw new RuntimeException("방 키를 가져올 수 없습니다");
        }

        if (roomKey == null) {
            throw new RuntimeException("방 키가 없습니다");
        }

        try {
            // 1. 현재 방의 상태 가져오기
            GameStatus gameStatus = roomRepository.getRoom(roomKey).getGameStatus();

            // 2. 방에 있는 플레이어 목록 가져오기
            List<Player> players = roomRepository.getRoom(roomKey).getPlayers();

            // 3. 현재 접속한 플레이어 정보 가져오기
            Player currentPlayer = (Player) session.getAttribute("player");

            // 4. 데이터 담기
            gameData.put("gameStatus", gameStatus);
            gameData.put("players", players);
            gameData.put("currentPlayer", currentPlayer);

            System.out.println("게임 데이터를 보냅니다: " + gameData);

        } catch (Exception e) {
            System.out.println("게임 데이터 조회 중 오류 발생: " + e.getMessage());
            throw new RuntimeException("게임 데이터를 가져올 수 없습니다");
        }

        return gameData;
    }

    // 관리자용 API 엔드포인트들
    @PostMapping("/admin/status")
    public ResponseEntity<?> updateGameStatus(@RequestBody Map<String, Object> request) {
        try {
            Integer roomKey = (Integer) request.get("roomKey");
            String newStatus = (String) request.get("gameStatus");

            log.info("게임 상태 변경 요청 - 방: {}, 새로운 상태: {}", roomKey, newStatus);

            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                return ResponseEntity.badRequest().body("방을 찾을 수 없습니다: " + roomKey);
            }

            room.setGameStatus(GameStatus.valueOf(newStatus));

            log.info("게임 상태 변경 완료 - 방: {}", roomKey);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            log.error("게임 상태 변경 실패", e);
            return ResponseEntity.badRequest().body("게임 상태 변경 실패: " + e.getMessage());
        }
    }

    @PostMapping("/admin/player/update")
    public ResponseEntity<?> updatePlayerStatus(@RequestBody Map<String, Object> request) {
        try {
            Integer roomKey = (Integer) request.get("roomKey");
            Integer playerNumber = (Integer) request.get("playerNumber");
            Boolean isAlive = (Boolean) request.get("isAlive");
            String role = (String) request.get("role");

            log.info("플레이어 상태 변경 요청 - 방: {}, 플레이어: {}, 생존: {}, 역할: {}",
                    roomKey, playerNumber, isAlive, role);

            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                return ResponseEntity.badRequest().body("방을 찾을 수 없습니다: " + roomKey);
            }

            Player player = room.getPlayerByPlayerNumber(playerNumber);
            if (player == null) {
                return ResponseEntity.badRequest().body("플레이어를 찾을 수 없습니다: " + playerNumber);
            }

            if (isAlive != null)
                player.setAlive(isAlive);
            if (role != null)
                player.setRole(Role.valueOf(role));

            log.info("플레이어 상태 변경 완료 - 방: {}, 플레이어: {}", roomKey, playerNumber);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            log.error("플레이어 상태 변경 실패", e);
            return ResponseEntity.badRequest().body("플레이어 상태 변경 실패: " + e.getMessage());
        }
    }

    // 클라이언트의 유저이름이 방장이름과 같은지 확인하고 응답
    @PostMapping("/host/{roomKey}")
    public ResponseEntity<?> recieveIsHost(@PathVariable("roomKey") Integer roomKey,
            @RequestBody Map<String, Object> request) {
        String userName = (String) request.get("username");

        String hostName = roomRepository.getRoom(roomKey).getHostName();

        if (hostName == null) {
            log.error("??? 말이 안되요. 왜 호스트가 없어요???");
            return ResponseEntity.badRequest().body("호스트가 없습니다.");
        }

        // 방장여부 체크해서 클라에 각각 응답
        if (hostName.equals(userName)) {
            return ResponseEntity.ok(true);
        } else {
            return ResponseEntity.ok(false);
        }
    }

    // 투표 결과 처리 서버에서 일단 처리 이후 응답해서 클라에서 소켓처리 이 모든 요청은 방장이~~
    // 들어오는 녀석의 정체 룸키, 동기화된 투표 결과
    @PostMapping("/admin/vote/result")
    public ResponseEntity<?> recieveVoteResult(@RequestBody Map<String, Object> request) {
        Integer roomKey = (Integer) request.get("roomKey");
        Map<Integer, Integer> voteStatus = (Map<Integer, Integer>) request.get("voteStatus");

        Room room = roomRepository.getRoom(roomKey);
        if (room == null) {
            return ResponseEntity.badRequest().body("방을 찾을 수 없습니다: " + roomKey);
        }

        room.setVoteStatus(voteStatus);
        Player mostVotedPlayer = room.getMostVotedPlayer();
        if (mostVotedPlayer == null) {
            return ResponseEntity.ok(null);
        } else {
            return ResponseEntity.ok(mostVotedPlayer);
        }
    }

    @PostMapping("/finalvote/{roomKey}")
    public ResponseEntity<?> handleFinalVote(
        @PathVariable("roomKey") Integer roomKey,
        @RequestBody FinalVoteRequest request
    ) {
        try {
            log.info("최종 투표 요청 수신 - 방: {}, 플레이어: {}, 찬성여부: {}", 
                roomKey, request.playerNumber(), request.isAgree());
                
            Room room = roomRepository.getRoom(request.roomKey());
            if (room == null) {
                return ResponseEntity.badRequest().body("방을 찾을 수 없습니다.");
            }

            room.processFinalVote(request.playerNumber(), request.isAgree());
            return ResponseEntity.ok(true);
        } catch (Exception e) {
            log.error("최종 투표 처리 실패", e);
            return ResponseEntity.badRequest().body("투표 처리 실패: " + e.getMessage());
        }
    }

    record FinalVoteRequest(
            Integer roomKey,
            Integer playerNumber,
            boolean isAgree) {
    }

    // 방에 플레이어 목록 조회
    @GetMapping("/players/{roomKey}")
    public ResponseEntity<List<Player>> getPlayers(@PathVariable("roomKey") Integer roomKey) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                return ResponseEntity.notFound().build();
            }
            List<Player> players = room.getPlayers();
            log.info("방 {}의 플레이어 리스트 조회: {}", roomKey, players);
            return ResponseEntity.ok(players);
        } catch (Exception e) {
            log.error("플레이어 리스트 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/game/host/{roomKey}")
    public ResponseEntity<Boolean> checkHost(
            @PathVariable(name = "roomKey") Integer roomKey, // name 속성 추가
            @RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            Room room = roomRepository.getRoom(roomKey);

            if (room == null || username == null) {
                log.error("방 또는 유저네임이 없음. roomKey: {}, username: {}", roomKey, username);
                return ResponseEntity.badRequest().build();
            }

            boolean isHost = username.equals(room.getHostName());
            log.info("방장 여부 확인 - 방: {}, 유저: {}, 결과: {}", roomKey, username, isHost);
            return ResponseEntity.ok(isHost);
        } catch (Exception e) {
            log.error("방장 여부 확인 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}