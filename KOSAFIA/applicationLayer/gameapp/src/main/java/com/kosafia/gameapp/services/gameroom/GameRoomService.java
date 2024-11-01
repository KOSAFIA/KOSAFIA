package com.kosafia.gameapp.services.gameroom;

import com.kosafia.gameapp.models.gameroom.GameRoomDto;

public interface GameRoomService {
    GameRoomDto createRoom(GameRoomDto gameRoomDto, Long creatorId);
    GameRoomDto getRoomById(Long roomId);
    void deleteRoom(Long roomId);
}
