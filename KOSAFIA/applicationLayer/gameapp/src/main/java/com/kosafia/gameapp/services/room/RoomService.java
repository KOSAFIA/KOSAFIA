package com.kosafia.gameapp.services.room;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.models.user.UserData;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;
import com.kosafia.gameapp.services.user.UserService;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserService userService;

    @Autowired
    public RoomService(RoomRepository roomRepository, UserService userService) {
        this.roomRepository = roomRepository;
        this.userService = userService;
    }


    // 초기화 메서드: 서버 시작 시 임시 방 생성
    @PostConstruct
    public void init() {
        // 서버 시작 시 임시 방 생성
        createTestRoom();
    }

    // 테스트용 임시 방 생성
    private void createTestRoom() {
        String roomName = "testRoom";
        String password = null; // 공개 방으로 설정
        boolean isPrivate = false;

        Room room = roomRepository.createRoom(roomName, password, isPrivate);
        System.out.println("초기 룸 생성 완료: " + roomName);
    }



    // 세션에서 유저 정보를 가져오는 메서드
    public UserData getUserDataFromSession(HttpSession session) {
        return userService.getUserData(session); // UserService의 getUserData 사용
    }

    // 방 생성
    public Room createRoom(String roomName, String password, boolean isPrivate) {
         // 비밀방이 아닌 경우 password를 null로 설정
        String roomPassword = isPrivate ? password : null;
        return roomRepository.createRoom(roomName, roomPassword, isPrivate);
    }

    // 방 삭제
    public void deleteRoom(Integer roomKey) {
        roomRepository.removeRoom(roomKey);
    }

    
    public Room getRoomById(Integer roomKey) {
        return roomRepository.getRoom(roomKey);
    }


    // 모든 방 조회
    public Map<Integer, Room> getAllRooms() {
        return roomRepository.getAllRooms();
    }



    // 방에 플레이어 추가(입장)
    public Player joinRoom(Integer roomKey, UserData userData) {
        Room room = roomRepository.getRoom(roomKey);
        if (room != null) {
            if(room.addPlayer(userData.getUsername(), userData.getUserEmail())){
               return room.getPlayerByUserEmail(userData.getUserEmail());
            }
            else{
                log.warn("그런 플레이어 없어여");
                return null;
            }
        }
        log.warn("방이없어여");
        return null;
    }

    // 방에서 플레이어 나가기
    public boolean leaveRoom(Integer roomKey, Player player) {
        Room room = roomRepository.getRoom(roomKey);
        if (room != null) {
            return room.removePlayer(player);
        }
        return false;
    }

    // 게임 시작 메서드
    public List<Player> startGame(Integer roomKey, UserData userData) {
        Room room = roomRepository.getRoom(roomKey);
        if (room == null) {
            return null; // 방이 존재하지 않음
        }

        // // 방장이 아닐 경우 게임 시작 불가
        // if (!room.isHost(userData.getUsername())) {
        //     return null;
        // }

        room.startGame(); // Room의 게임 시작 메서드 호출
        return room.getPlayers(); // 게임 시작 시 모든 플레이어 정보 반환
    }

    // 방 종료
    public void endGame(Integer roomKey) {
        Room room = roomRepository.getRoom(roomKey);
        if (room != null) {
            room.endGame();
        }
    }

    
}
