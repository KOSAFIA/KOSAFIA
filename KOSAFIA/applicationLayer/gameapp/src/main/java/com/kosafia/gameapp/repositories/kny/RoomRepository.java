package com.kosafia.gameapp.repositories.kny;

import java.util.List;

import com.kosafia.gameapp.dto.kny.GameRoomDTO;

public interface RoomRepository {
    GameRoomDTO createRoom(GameRoomDTO roomDTO);
    List<GameRoomDTO> getAllRooms();
    GameRoomDTO getRoom(Long roomId);
    void deleteRoom(Long roomId);
    void updateRoom(GameRoomDTO roomDTO);
}
