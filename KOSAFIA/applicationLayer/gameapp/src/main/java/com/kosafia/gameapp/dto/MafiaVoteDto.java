package com.kosafia.gameapp.dto;

public class MafiaVoteDto {
    private int voterId; // 투표자 ID
    private int targetId; // 투표 대상 ID
    private int turnId; // 현재 턴 ID
    private String voteType; // 투표 유형

    public int getVoterId() {
        return voterId;
    }

    public void setVoterId(int voterId) {
        this.voterId = voterId;
    }

    public int getTargetId() {
        return targetId;
    }

    public void setTargetId(int targetId) {
        this.targetId = targetId;
    }

    public int getTurnId() {
        return turnId;
    }

    public void setTurnId(int turnId) {
        this.turnId = turnId;
    }

    public String getVoteType() {
        return voteType;
    }

    public void setVoteType(String voteType) {
        this.voteType = voteType;
    }
}
