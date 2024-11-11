package com.kosafia.gameapp.controllers.game;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;
import com.kosafia.gameapp.services.game.GameService;

@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    private GameService gameService;

    // 인스턴스 변수로 players 리스트 선언
    private ArrayList<Player> players = new ArrayList<>();

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
}
