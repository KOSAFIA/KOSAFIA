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

    //  @PostConstruct
    // public void init() {
    //     // 서버 시작 시 임시 룸 생성
    //     createRoom(1);
    //     System.out.println("초기 룸 생성 완료: testRoom");

    // }

    
    // // 룸 추가
    // public Room createRoom(Integer roomId) {
    //     Room room = new Room(roomId, 8);
    //     roomMap.put(roomId.toString(), room);
    //     return room;
    // }

    // // 룸 조회
    // public Room getRoom(Integer roomId) {
    //     return roomMap.get(roomId.toString());
    // }

    //    // 룸 삭제
    //    public void deleteRoom(Integer roomId) {
    //     roomMap.remove(roomId.toString()); 
    // }

    // // 전체 룸 리스트 반환
    // public Collection<Room> getAllRooms() {
    //     return roomMap.values();
    // }
    
    
    // // 방 추가
    // public void addRoom(Room room) {
    //     roomMap.put(room.getRoomKey().toString(), room);
    // }
    
      // 방 생성 메서드 (roomKey 자동 증가)
      public Room createRoom(String roomName, String password, boolean isPrivate) {
        // Integer roomKey = Integer.valueOf(nextRoomKey++); // roomKey로 auto-increment 값을 사용
        int roomKey = nextRoomKey++;
        Room room = new Room(roomKey, roomName, password, isPrivate);
        roomMap.put(roomKey, room);
        return room;
    }


    // 방 삭제
    public void removeRoom(Integer roomKey) {
        roomMap.remove(roomKey);
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
