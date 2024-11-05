package com.kosafia.gameapp.services;

import java.util.List;
import java.util.Map;

import com.kosafia.gameapp.dto.MafiaVoteDto;

public interface GameService {
    void handleVote(MafiaVoteDto mafiaVoteDto);

    // 득표 결과 조회 메서드
    List<Map<String, Object>> getVoteResults(int turnId);

    // 투표 종료 시 최종 득표 결과를 판단하는 메서드
    String determineFinalVoteOutcome(int turnId);
}
