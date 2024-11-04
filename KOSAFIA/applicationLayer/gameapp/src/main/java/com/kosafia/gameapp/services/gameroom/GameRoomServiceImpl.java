package com.kosafia.gameapp.services.gameroom;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kosafia.gameapp.cache.gameroom.GameRoomCache;
import com.kosafia.gameapp.mapper.gameroom.GameRoomMapper;
import com.kosafia.gameapp.models.gameroom.GameRoom;
import com.kosafia.gameapp.models.gameroom.GameRoomDto;

@Service
public class GameRoomServiceImpl  implements GameRoomService{
    @Autowired
    private GameRoomMapper gameRoomMapper;

    @Autowired
    private GameRoomCache gameRoomCache;

    @Override
    public GameRoomDto createRoom(GameRoomDto gameRoomDto, Long creatorId) {
        GameRoom gameRoom = gameRoomDto.toEntity();
        gameRoom.setCreatorId(creatorId);
        gameRoom.setCreatedAt(LocalDateTime.now());
        gameRoom.setCurrentPlayers(1); // 방장 한 명이 있는 상태로 시작

        // // DB에 저장
        // gameRoomMapper.insertGameRoom(gameRoom);

          // Redis에 캐시 저장 (방 생성 시 우선 Redis에만 저장)
        gameRoomCache.saveGameRoom(gameRoom);

        return new GameRoomDto(gameRoom);
    }

    @Override
    public GameRoomDto getRoomById(Long roomId) {
        GameRoom gameRoom = gameRoomCache.getGameRoom(roomId);
        if (gameRoom == null) {
            gameRoom = gameRoomMapper.selectGameRoomById(roomId);
            if (gameRoom != null) {
                gameRoomCache.saveGameRoom(gameRoom);
            }
        }
        return gameRoom != null ? new GameRoomDto(gameRoom) : null;
    }

    @Override
    public void deleteRoom(Long roomId) {
        // Redis에서 삭제
        gameRoomCache.deleteGameRoom(roomId);
        // DB에서 삭제 (게임 종료 시 최종 데이터 저장 후 삭제)
        gameRoomMapper.deleteGameRoom(roomId);
      
    }


    @Override
    public List<GameRoomDto> getAllRooms() {
        List<GameRoom> gameRooms = gameRoomCache.getAllGameRooms();
        // if (gameRooms.isEmpty()) {
        //     gameRooms = gameRoomMapper.selectAllGameRooms();
        //     gameRooms.forEach(gameRoomCache::saveGameRoom);
        // }
        return gameRooms.stream().map(GameRoomDto::new).collect(Collectors.toList());
    }

    @Override
    public List<GameRoomDto> getRoomsBySearch(String searchKeyword) {
        List<GameRoom> gameRooms = gameRoomMapper.selectGameRoomsBySearch(searchKeyword);
        return gameRooms.stream().map(GameRoomDto::new).collect(Collectors.toList());
    }

    @Override
    public List<GameRoomDto> getWaitingRooms() {
        List<GameRoom> gameRooms = gameRoomMapper.selectWaitingGameRooms();
        return gameRooms.stream().map(GameRoomDto::new).collect(Collectors.toList());
    }

    


}
