package com.kosafia.gameapp.services.gameroom;

import java.util.List;

import com.kosafia.gameapp.models.gameroom.GameRoomDto;

public interface GameRoomService {
    GameRoomDto createRoom(GameRoomDto gameRoomDto, Long creatorId);
    GameRoomDto getRoomById(Long roomId);
    void deleteRoom(Long roomId);

    List<GameRoomDto> getAllRooms(); // 전체 방 조회 메소드 추가
    List<GameRoomDto> getRoomsBySearch(String searchKeyword); // 검색어로 방 조회 메소드 추가
    List<GameRoomDto> getWaitingRooms(); // 대기 방 조회 메소드 추가

}
