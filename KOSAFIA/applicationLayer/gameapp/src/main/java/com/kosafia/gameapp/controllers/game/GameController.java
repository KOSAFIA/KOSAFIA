package com.kosafia.gameapp.controllers.game;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;
import com.kosafia.gameapp.services.game.GameService;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    private GameService gameService;

    @Autowired
    private RoomRepository roomRepository;

    // 역할을 할당하는 메소드
    @PostMapping("/assignRoles")
    public void assignRoles(@RequestBody ArrayList<Player> players) {
        gameService.assignRoles(players);
    }

    // 역할을 조회하는 메소드
    @PostMapping("/getRoles")
    public ArrayList<Player> getRoles(@RequestBody ArrayList<Player> players) {
        gameService.assignRoles(players);

        System.out.println("응답 데이터: " + players);

        return players;
    }

    //김남영 추가
    // 현재 게임 상태를 가져오는 API
    @GetMapping("/current-data")
    public Map<String, Object> getGameData(@RequestParam String roomKey, HttpSession session) {
        Map<String, Object> gameData = new HashMap<>();
        
        try {
            // 1. 현재 방의 상태 가져오기
            String gameState = gameService.getGameState(roomKey);
            
            // 2. 방에 있는 플레이어 목록 가져오기
            List<Player> players = gameService.getPlayers(roomKey);
            
            // 3. 현재 접속한 플레이어 정보 가져오기
            Player currentPlayer = gameService.getCurrentPlayer(session);
            
            // 4. 데이터 담기
            gameData.put("gameState", gameState);
            gameData.put("players", players);
            gameData.put("currentPlayer", currentPlayer);
            
            System.out.println("게임 데이터를 보냅니다: " + gameData);
            
        } catch (Exception e) {
            System.out.println("게임 데이터 조회 중 오류 발생: " + e.getMessage());
            throw new RuntimeException("게임 데이터를 가져올 수 없습니다");
        }
        
        return gameData;
    }
}
