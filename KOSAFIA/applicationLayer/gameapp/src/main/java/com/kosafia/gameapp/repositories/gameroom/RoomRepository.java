package com.kosafia.gameapp.repositories.gameroom;
import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.kosafia.gameapp.models.gameroom.Room;

import jakarta.annotation.PostConstruct;

@Component
public class RoomRepository {
    private final ConcurrentHashMap<String, Room> roomMap = new ConcurrentHashMap<>();

     @PostConstruct
    public void init() {
        // 서버 시작 시 임시 룸 생성
        createRoom(1);
        System.out.println("초기 룸 생성 완료: testRoom");

    }
    // 룸 추가
    public Room createRoom(Integer roomId) {
        Room room = new Room(roomId, 8);
        roomMap.put(roomId.toString(), room);
        return room;
    }

    // 룸 조회
    public Room getRoom(Integer roomId) {
        return roomMap.get(roomId.toString());
    }

       // 룸 삭제
       public void deleteRoom(Integer roomId) {
        roomMap.remove(roomId.toString());
    }

    // 전체 룸 리스트 반환
    public Collection<Room> getAllRooms() {
        return roomMap.values();
    }
    
}
