package com.kosafia.gameapp.knytestset;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.*;

import com.kosafia.gameapp.dto.chat.room.RoomChatMessage;
import com.kosafia.gameapp.dto.chat.room.RoomChatMessage.MessageType;
import com.kosafia.gameapp.dto.chat.room.RoomJoinResponse;
import com.kosafia.gameapp.knytestset.Room.RoomStatus;
import com.kosafia.gameapp.models.user.User;

import com.kosafia.gameapp.services.user.UserService;

import jakarta.annotation.*;
import jakarta.servlet.http.HttpSession;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomServiceKny {
    private final RoomRepositoryKny roomRepository;
    private final UserService userService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final HttpSession httpSession;  // 세션 주입

    
    @PostConstruct
    public void init() {
        // Create initial rooms when server starts
        createInitialRooms();
    }
    
    private void createInitialRooms() {
        // Create some test rooms
        for (int i = 1; i <= 3; i++) {
            Room room = Room.builder()
                    .roomId("room" + i)
                    .name("Game Room " + i)
                    .users(ConcurrentHashMap.newKeySet()) // Thread-safe Set for users
                    .maxUsers(8)
                    .status(RoomStatus.WAITING)
                    .build();
            roomRepository.save(room);
            log.info("Created room: {}", room.getRoomId());
        }
    }
    
    public Room joinRoom(String roomId, Long userId) {
        log.info("방 입장 요청 - roomId: {}, userId: {}", roomId, userId);
        
        // 1. 방 존재 여부 확인
        Room room = roomRepository.findById(roomId);
        if (room == null) {
            log.error("방을 찾을 수 없습니다. roomId: {}", roomId);
            throw new Exception("방을 찾을 수 없습니다.");
        }

        // 2. 세션에서 유저 정보 확인
        User user = userService.getUserFromSession(httpSession);
        if (user == null || !user.getUserId().equals(userId)) {
            log.error("세션 유저 정보가 올바르지 않습니다. userId: {}", userId);
            throw new Exception("세션이 유효하지 않습니다.");
        }

        // 3. 방 입장 가능 여부 확인
        if (room.isFull()) {
            log.error("방이 가득 찼습니다. roomId: {}", roomId);
            throw new Exception("방이 가득 찼습니다.");
        }

        // 4. 방에 유저 추가
        if (room.addUser(user)) {
            room = roomRepository.save(room);
            broadcastUserJoin(room, user);
            broadcastUserList(room);
            log.info("방 입장 성공 - roomId: {}, userId: {}", roomId, userId);
            return room;
        } else {
            log.error("방 입장 실패 - roomId: {}, userId: {}", roomId, userId);
            throw new Exception("방 입장에 실패했습니다.");
        }
    }

    private void broadcastUserJoin(Room room, User user) {
        RoomChatMessage joinMessage = RoomChatMessage.builder()
                .type(MessageType.ENTER)
                .roomId(room.getRoomId())
                .userId(user.getUserId())
                .username(user.getUsername())
                .content(user.getUsername() + "님이 입장하셨습니다.")
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/room." + room.getRoomId(), joinMessage);
        log.debug("입장 메시지 전송 완료 - roomId: {}, userId: {}", room.getRoomId(), user.getUserId());
    }

    private void broadcastUserList(Room room) {
        RoomChatMessage userListMessage = RoomChatMessage.builder()
                .type(MessageType.USER_LIST)
                .roomId(room.getRoomId())
                .users(new ArrayList<>(room.getUsers()))
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend(
            "/topic/room." + room.getRoomId() + ".users", 
            userListMessage
        );
        log.debug("유저 리스트 업데이트 전송 완료 - roomId: {}", room.getRoomId());
    }
}