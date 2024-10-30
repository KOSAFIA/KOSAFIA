package com.kosafia.gameapp.models.socketenum;

public enum MessageType {
    CHAT_LOBBY,          // 로비 채팅
    CHAT_ROOM,          // 게임방 채팅
    CHAT_GAME,          // 게임 중 채팅
    // ===========
    STATUS_ROOM,        // 방 정보 업데이트
    STATUS_USER,        // 유저 상태 업데이트
    STATUS_GAME,         // 게임 상태 업데이트
    // ===========
    NOTIFY_SYSTEM,     // 시스템 메시지
    NOTIFY_JOIN,       // 입장 메시지
    NOTIFY_LEAVE,      // 퇴장 메시지
    NOTIFY_ROLE,       // 역할 관련 메시지

    // ===========
    GAME_NIGHT,
    GAME_DAY,
    GAME_VOTE,
    GAME_CROSS_VOTE
}
