package com.kosafia.gameapp.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.kosafia.gameapp.dto.MafiaVoteDto;
import com.kosafia.gameapp.services.GameService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vote")
public class GameController {

    @Autowired
    private GameService gameService;

    @PostMapping
    public void vote(@RequestBody MafiaVoteDto mafiaVoteDto) {
        gameService.handleVote(mafiaVoteDto);
    }

    // 특정 턴의 득표 결과 조회
    @GetMapping("/results")
    public List<Map<String, Object>> getVoteResults(@RequestParam("turnId") int turnId) {
        return gameService.getVoteResults(turnId);
    }

    // 최종 투표 결과를 조회하여 밤/최후의 변론 단계를 결정하는 API
    @GetMapping("/finalOutcome")
    public String getFinalVoteOutcome(@RequestParam("turnId") int turnId) {
        return gameService.determineFinalVoteOutcome(turnId);
    }
}
