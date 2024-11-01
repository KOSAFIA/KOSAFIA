package com.kosafia.gameapp.controllers.kny;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kosafia.gameapp.dto.kny.GameRoomDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// controllers/GameRoomController.java

@RestController
@RequestMapping("/api/room")
@Slf4j
public class GameRoomController {

   // 테스트용 메모리 저장소
   private static Long roomIdCounter = 1L;
   private final Map<Long, GameRoomDTO> rooms = new ConcurrentHashMap<>();

   private final SimpMessageSendingOperations template; // STOMP 메시징 템플릿

   public GameRoomController(SimpMessageSendingOperations template) {
       this.template = template;
       // 테스트용 더미 데이터 추가
       addTestRoom("테스트방1", 6, false, "");
       addTestRoom("비밀테스트방", 8, true, "1234");
       log.info("테스트용 더미 방 2개 생성 완료");
   }

   // 테스트용 더미 데이터 생성 메서드
   private void addTestRoom(String name, int maxPlayers, boolean isPrivate, String password) {
       GameRoomDTO room = new GameRoomDTO();
       room.setRoomId(roomIdCounter++);
       room.setRoomName(name);
       room.setMaxPlayers(maxPlayers);
       room.setCurrentPlayers(1);
       room.setPrivate(isPrivate);
       room.setRoomPassword(password);
       room.setRoomStatus("WAITING");
       rooms.put(room.getRoomId(), room);
       log.info("테스트 방 생성: {}", room);
   }

   @PostMapping("/create")
   public ResponseEntity<GameRoomDTO> createRoom(@RequestBody GameRoomDTO roomDTO) {
       log.info("방 생성 요청 수신: {}", roomDTO);  // 요청 데이터 로깅

       try {
           // 입력값 검증
           if (roomDTO.getRoomName() == null || roomDTO.getRoomName().trim().isEmpty()) {
               log.error("방 이름이 비어있음");
               return ResponseEntity.badRequest().build();
           }

           if (roomDTO.getMaxPlayers() < 4 || roomDTO.getMaxPlayers() > 8) {
               log.error("잘못된 최대 인원: {}", roomDTO.getMaxPlayers());
               return ResponseEntity.badRequest().build();
           }

           // 비밀방인 경우 비밀번호 검증
           if (roomDTO.isPrivate() && (roomDTO.getRoomPassword() == null || roomDTO.getRoomPassword().trim().isEmpty())) {
               log.error("비밀방인데 비밀번호가 비어있음");
               return ResponseEntity.badRequest().build();
           }

           // roomId 생성
           Long roomId = roomIdCounter++;
           roomDTO.setRoomId(roomId);
           
           log.info("생성된 방 ID: {}", roomId);

           // 방 정보 저장
           rooms.put(roomId, roomDTO);
           
           log.info("현재 총 방 개수: {}", rooms.size());

           // STOMP로 방 생성 알림 브로드캐스트
           List<GameRoomDTO> roomList = new ArrayList<>(rooms.values());
           template.convertAndSend("/topic/rooms", roomList);
           log.info("방 목록 브로드캐스트 전송. 현재 방 목록: {}", roomList);
           
           return ResponseEntity.ok(roomDTO);
           
       } catch (Exception e) {
           log.error("방 생성 중 예외 발생", e);
           return ResponseEntity.internalServerError().build();
       }
   }

   @GetMapping("/list")
   public ResponseEntity<List<GameRoomDTO>> getRoomList() {
       log.info("방 목록 조회 요청");
       List<GameRoomDTO> roomList = new ArrayList<>(rooms.values());
       log.info("응답할 방 목록: {}", roomList);
       return ResponseEntity.ok(roomList);
   }

   // 테스트용 API: 특정 방 정보 조회
   @GetMapping("/{roomId}")
   public ResponseEntity<GameRoomDTO> getRoom(@PathVariable Long roomId) {
       log.info("방 정보 조회 요청. roomId: {}", roomId);
       GameRoomDTO room = rooms.get(roomId);
       if (room == null) {
           log.error("방을 찾을 수 없음. roomId: {}", roomId);
           return ResponseEntity.notFound().build();
       }
       log.info("조회된 방 정보: {}", room);
       return ResponseEntity.ok(room);
   }

   // 테스트용 API: 모든 방 삭제
   @DeleteMapping("/clear")
   public ResponseEntity<Void> clearRooms() {
       log.info("전체 방 삭제 요청. 삭제 전 방 개수: {}", rooms.size());
       rooms.clear();
       roomIdCounter = 1L;
       template.convertAndSend("/topic/rooms", new ArrayList<>());
       log.info("전체 방 삭제 완료");
       return ResponseEntity.ok().build();
   }
}