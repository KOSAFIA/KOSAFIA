package com.kosafia.gameapp.repositories.gameroom;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.kosafia.gameapp.models.gameroom.Room;

import jakarta.annotation.PostConstruct;

@Component
public class RoomRepository {
    private final Map<Integer, Room> roomMap = new ConcurrentHashMap<>();
    private int nextRoomKey = 1; // auto-increment 변수
    
      // 방 생성 메서드 (roomKey 자동 증가)
      public Room createRoom(String roomName, int maxPlayers, String password, boolean isPrivate) {
        // Integer roomKey = Integer.valueOf(nextRoomKey++); // roomKey로 auto-increment 값을 사용
        int roomKey = nextRoomKey++;
        Room room = new Room(roomKey, roomName, maxPlayers, password, isPrivate);
        roomMap.put(roomKey, room);
        return room;
    }


    // 방 삭제
    public void removeRoom(Integer roomKey) {
        roomMap.remove(roomKey);
        System.out.println("방이 성공적으로 삭제되었습니다. roomKey: " + roomKey);
    }

    // 방 조회
    public Room getRoom(Integer roomKey) {
        return roomMap.get(roomKey);
    }

    // 모든 방 조회
    public Map<Integer, Room> getAllRooms() {
        return roomMap;
    }


}
