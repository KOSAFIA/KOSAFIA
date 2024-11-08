package com.kosafia.gameapp.controllers.game;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.services.game.GameService;

@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    private GameService gameService;

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
}
