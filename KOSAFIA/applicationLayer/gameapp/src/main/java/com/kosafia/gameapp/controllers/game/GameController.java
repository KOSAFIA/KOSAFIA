package com.kosafia.gameapp.controllers.game;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;
import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;
import com.kosafia.gameapp.services.game.GameService;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/game")
@Slf4j
@RequiredArgsConstructor
public class GameController {

    @Autowired
    private GameService gameService;

    // 인스턴스 변수로 players 리스트 선언
    private ArrayList<Player> players = new ArrayList<>();

    @Autowired
    private RoomRepository roomRepository;

    // 역할을 할당하는 메소드
    @PostMapping("/assignRoles")
    public void assignRoles(@RequestBody ArrayList<Player> players) {
        gameService.assignRoles(players);
    }

    // 역할을 조회하고 players 리스트 초기화
    @GetMapping("/getRoles")
    public ArrayList<Player> getRoles(@RequestParam List<String> name) {
        // 하드코딩된 플레이어 목록 생성 -> 후에 수정
        players = new ArrayList<>(); // 기존 players 인스턴스 변수 초기화
        players.add(new Player(1, "Player1", "player1@example.com"));
        players.add(new Player(2, "Player2", "player2@example.com"));
        players.add(new Player(3, "Player3", "player3@example.com"));
        players.add(new Player(4, "Player4", "player4@example.com"));
        players.add(new Player(5, "Player5", "player5@example.com"));
        players.add(new Player(6, "Player6", "player6@example.com"));
        players.add(new Player(7, "Player7", "player7@example.com"));
        players.add(new Player(8, "Player8", "player8@example.com"));

        // 역할을 할당하는 로직 호출
        gameService.assignRoles(players);
        System.out.println("응답 데이터: " + players);

        return players;
    }

    // 마피아 밤 상호작용 메소드 (GET 요청)
    @GetMapping("/mafia/select")
    public boolean mafiaSelectTarget(@RequestParam Integer targetNumber) {
        return gameService.mafiaSelectTarget(players, targetNumber);
    }

    // 의사 밤 상호작용 메소드 (GET 요청)
    @GetMapping("/doctor/save")
    public boolean doctorSavePlayer(@RequestParam Integer targetNumber) {
        return gameService.doctorSavePlayer(players, targetNumber);
    }

    // 경찰 밤 상호작용 메소드 (GET 요청)
    @GetMapping("/police/check")
    public String policeCheckRole(@RequestParam Integer targetNumber) {
        Role role = gameService.policeCheckRole(players, targetNumber);
        return "Role: " + role;
    }

    // 밤 상호작용 결과를 처리하는 메소드
    @GetMapping("/night/result")
    public void resolveNightActions() {
        gameService.nightActionResult(players);
    }

    // 현재 플레이어 목록을 반환
    @GetMapping("/players")
    public List<Player> getPlayers() {
        return players;
    }

    //김남영 추가
    // 현재 게임 상태를 가져오는 API
    @PostMapping("/current-data")
    public Map<String, Object> getGameData(HttpSession session, @RequestBody Map<String, Object> roomInfo) {
        Map<String, Object> gameData = new HashMap<>();
        
        // Integer roomKey = (Integer)roomInfo.get("roomKey");
        Integer roomKey = null;

        //이 자식의 세션값에서 룸키 값 가져오기
        try {
            roomKey = (Integer)session.getAttribute("roomKey");
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
            room.setGameStatus(GameStatus.valueOf(newStatus));
            
            log.info("게임 상태 변경 완료 - 방: {}", roomKey);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            log.error("게임 상태 변경 실패", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/admin/player/update")
    public ResponseEntity<?> updatePlayerStatus(@RequestBody Map<String, Object> request) {
        try {
            log.info("플레이어 상태 변경 요청: {}", request);

            Integer roomKey = (Integer) request.get("roomKey");
            Integer playerNumber = (Integer) request.get("playerNumber");
            Boolean isAlive = (Boolean) request.get("isAlive");
            String role = (String) request.get("role");
            
            Room room = roomRepository.getRoom(roomKey);
            Player player = null;

            player = room.getPlayerByPlayerNumber(playerNumber);

            if (isAlive != null) player.setAlive(isAlive);
            if (role != null) player.setRole(Role.valueOf(role));

            log.info("플레이어 상태 변경 완료 - 방: {}, 플레이어: {}", roomKey, playerNumber);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            log.error("플레이어 상태 변경 실패", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
