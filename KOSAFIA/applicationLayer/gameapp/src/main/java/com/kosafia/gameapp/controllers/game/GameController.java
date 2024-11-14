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

    @GetMapping("/getRoles")
    public ArrayList<Player> getRoles(@RequestParam List<Integer> playerNumber) {
        // 하드코딩된 플레이어 목록 생성 -> 후에 수정 가능
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
        System.out.println("전체 플레이어 리스트: " + players);

        // 요청된 playerNumber 리스트에 따라 필터링
        ArrayList<Player> filteredPlayers = new ArrayList<>();
        for (Player player : players) {
            if (playerNumber.contains(player.getPlayerNumber())) {
                filteredPlayers.add(player);
            }
        }

        System.out.println("필터링된 플레이어 리스트: " + filteredPlayers);
        return filteredPlayers;
    }

    @PostMapping("/night/mafia")
    public String selectMafiaTarget(@RequestParam Integer targetNumber) {
        gameService.mafiaSelectTarget(players, targetNumber);
        return "마피아 타겟이 설정되었습니다.";
    }

    @PostMapping("/night/doctor")
    public String selectDoctorTarget(@RequestParam Integer targetNumber) {
        gameService.doctorSavePlayer(players, targetNumber);
        return "의사가 치료할 타겟이 설정되었습니다.";
    }

    @GetMapping("/night/police")
    public String checkPoliceTarget(@RequestParam Integer targetNumber) {
        Role role = gameService.policeCheckRole(players, targetNumber);
        return "타겟의 역할은: " + role;
    }

    @PostMapping("/night/resolve")
    public String resolveNightActions() {
        gameService.nightActionResult(players);
        return "밤 상호작용 결과가 처리되었습니다.";
    }
}
