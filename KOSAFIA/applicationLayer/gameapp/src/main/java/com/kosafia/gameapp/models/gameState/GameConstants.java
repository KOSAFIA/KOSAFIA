package com.kosafia.gameapp.models.gameState;

public class GameConstants {
    // 게임 페이즈(단계) 정의
    public enum GamePhase {
        WAITING,    // 게임 시작 전 대기
        NIGHT,      // 밤
        DAY,        // 낮
        VOTE,       // 투표
        FINAL_VOTE  // 최후 변론 및 최종 투표
    }

    // 게임 역할 정의
    public enum GameRole {
        CITIZEN,    // 시민
        MAFIA,      // 마피아
        DOCTOR,     // 의사
        POLICE      // 경찰
    }

    // 채팅 타입 정의
    public enum ChatType {
        PUBLIC,     // 전체 공개 채팅
        MAFIA,      // 마피아 채팅
        SYSTEM      // 시스템 메시지
    }
}
