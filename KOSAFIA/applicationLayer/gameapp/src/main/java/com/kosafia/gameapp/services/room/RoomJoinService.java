package com.kosafia.gameapp.services.room;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.models.user.UserData;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class RoomJoinService {

    private RoomRepository roomRepository;

    @Autowired
    public void RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    //메시지 문자열로 반환
    public ResponseEntity<String> joinRoom(@PathVariable Integer roomId, UserData userData) {
        // 세션에서 사용자 정보 가져오기
        // UserData userData = (UserData)session.getAttribute("user");


        log.info("servicejoin"+roomId);

        if (userData == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        // 룸 가져오기
        // Room room = roomRepository.getRoom(roomId);
        if (roomRepository.getRoom(roomId) == null) {
            return ResponseEntity.badRequest().body("방을 찾을 수 없습니다.");
        }

        // 유저를 룸에 바로 추가
        // boolean success = room.addUser(userData); //카피타입
        boolean success = roomRepository.getRoom(roomId).addUser(userData); //참조타입

        if (success) {
            log.info((roomId).toString());
            log.info(userData.toString());
            log.info(roomRepository.getRoom(roomId).toString());
            log.info(roomRepository.getRoom(roomId).getUsers().toString());

            
            return ResponseEntity.ok("방에 성공적으로 입장했습니다.");
        } else {
            return ResponseEntity.status(409).body("방이 가득 찼거나 이미 입장한 상태입니다.");
        }
    }


}
