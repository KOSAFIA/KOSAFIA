package com.kosafia.gameapp.models.socketenum;

public enum MessageType {
    CHAT_LOBBY,          // 로비 채팅
    CHAT_ROOM,          // 게임방 채팅
    CHAT_GAME,          // 게임 중 채팅
    ROOM_UPDATE,        // 방 정보 업데이트
    USER_STATUS,        // 유저 상태 업데이트
    GAME_STATUS         // 게임 상태 업데이트
}
