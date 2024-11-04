package com.kosafia.gameapp.cache.gameroom;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.kosafia.gameapp.models.gameroom.GameRoom;

@Component
public class GameRoomCache {
    @Autowired
    private RedisTemplate<String, GameRoom> redisTemplate;

    //저장
    public void saveGameRoom(GameRoom gameRoom) {
        String roomKey = "room:" + gameRoom.getRoomId();
        redisTemplate.opsForValue().set(roomKey, gameRoom);
    }

    //방번호로 조회
    public GameRoom getGameRoom(Long roomId) {
        String roomKey = "room:" + roomId;
        return redisTemplate.opsForValue().get(roomKey);
    }

    //삭제
    public void deleteGameRoom(Long roomId) {
        String roomKey = "room:" + roomId;
        redisTemplate.delete(roomKey);
    }

    //전체조회
    public List<GameRoom> getAllGameRooms() {
        Set<String> keys = redisTemplate.keys("room:*");
        if (keys == null) {
            return new ArrayList<>();
        }
        return keys.stream()
                .map(key -> redisTemplate.opsForValue().get(key))
                .collect(Collectors.toList());
    }    

    //대기방 조회
    public List<GameRoom> getWaitingGameRooms() {
        return getAllGameRooms().stream()
                .filter(gameRoom -> "waiting".equals(gameRoom.getRoomStatus()))
                .collect(Collectors.toList());
    }

    //검색어로 조회
    public List<GameRoom> searchGameRooms(String keyword) {
        return getAllGameRooms().stream()
                .filter(gameRoom -> gameRoom.getRoomName().contains(keyword))
                .collect(Collectors.toList());
    }
}
