package com.kosafia.gameapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kosafia.gameapp.dto.MafiaVoteDto;
import com.kosafia.gameapp.mapper.VoteMapper;

import java.util.List;
import java.util.Map;

@Service
public class GameServiceImpl implements GameService {

    @Autowired
    private VoteMapper voteMapper;

    @Override
    @Transactional
    public void handleVote(MafiaVoteDto mafiaVoteDto) {
        int voterId = mafiaVoteDto.getVoterId();
        int turnId = mafiaVoteDto.getTurnId();

        // 기존 투표가 있는 경우 삭제
        voteMapper.deletePreviousVote(turnId, voterId);

        // 새로운 투표 삽입
        voteMapper.insertVote(mafiaVoteDto);
    }

    @Override
    public List<Map<String, Object>> getVoteResults(int turnId) {
        // 특정 턴에 대한 득표 현황을 가져오는 쿼리 호출
        return voteMapper.getVoteResultsByTurn(turnId);
    }

    @Override
    public String determineFinalVoteOutcome(int turnId) {
        List<Map<String, Object>> voteResults = getVoteResults(turnId);

        if (voteResults.isEmpty()) {
            // 투표가 없는 경우 바로 밤으로 이동
            return "밤으로 이동";
        }

        // 최다 득표자 찾기
        int maxVotes = 0;
        int maxVotedTarget = -1;
        boolean tie = false;

        for (Map<String, Object> result : voteResults) {
            int votes = (int) result.get("votes");
            int targetId = (int) result.get("targetId");

            if (votes > maxVotes) {
                maxVotes = votes;
                maxVotedTarget = targetId;
                tie = false; // 새로운 최다 득표자 발견 시 동률 초기화
            } else if (votes == maxVotes) {
                tie = true; // 동률 발생
            }
        }

        // 득표 결과에 따라 다음 단계 결정
        if (tie || maxVotes == 0) {
            return "밤으로 이동";
        } else {
            return "최후의 변론으로 이동: 대상 ID = " + maxVotedTarget;
        }
    }
}
