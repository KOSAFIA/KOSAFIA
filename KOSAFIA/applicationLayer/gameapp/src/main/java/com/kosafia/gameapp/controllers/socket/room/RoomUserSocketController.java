package com.kosafia.gameapp.controllers.socket.room;

import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import com.kosafia.gameapp.dto.chat.room.RoomChatMessage;
import com.kosafia.gameapp.dto.chat.room.RoomChatMessage.MessageType;
import com.kosafia.gameapp.knytestset.Room;
import com.kosafia.gameapp.knytestset.RoomServiceKny;
import com.kosafia.gameapp.models.socket.UserSessionRepository;
import com.kosafia.gameapp.models.user.User;

import java.time.*;



@Controller
@RequiredArgsConstructor
@Slf4j
public class RoomUserSocketController {
    private final RoomServiceKny roomService;
    private final UserSessionRepository sessionRepository;
    private final SimpMessageSendingOperations messagingTemplate;
    
    @MessageMapping("/room.enter")
    public void handleRoomEnter(
            @Payload RoomChatMessage message, 
            @Header("simpSessionId") String sessionId) {
        log.debug("Room enter request - roomId: {}, userId: {}", 
                message.getRoomId(), message.getUserId());
                
        // 세션 업데이트
        sessionRepository.updateUserRoom(sessionId, message.getRoomId());
        
        // 유저 정보로 Room 참여
        User user = User.builder()
                .userId(Long.valueOf(message.getUserId()))
                .username(message.getUsername())
                .build();
                
        Room room = roomService.joinRoom(message.getRoomId(), user);
        
        // 입장 메시지 전송
        RoomChatMessage enterMessage = RoomChatMessage.builder()
                .type(MessageType.ENTER)
                .roomId(message.getRoomId())
                .userId(message.getUserId())
                .username(message.getUsername())
                .content(message.getUsername() + "님이 입장하셨습니다.")
                .timestamp(LocalDateTime.now())
                .build();
                
        messagingTemplate.convertAndSend(
            "/topic/room." + message.getRoomId(),
            enterMessage
        );
        
        // 유저 목록 업데이트 메시지 전송
        sendUserListUpdate(message.getRoomId());
    }
    
    @MessageMapping("/room.chat")
    public void handleRoomChat(@Payload RoomChatMessage message) {
        messagingTemplate.convertAndSend(
            "/topic/room." + message.getRoomId(),
            RoomChatMessage.builder()
                .type(MessageType.CHAT)
                .roomId(message.getRoomId())
                .userId(message.getUserId())
                .username(message.getUsername())
                .content(message.getContent())
                .timestamp(LocalDateTime.now())
                .build()
        );
    }
    
    @MessageMapping("/room.leave")
    public void handleRoomLeave(
            @Payload RoomChatMessage message,
            @Header("simpSessionId") String sessionId) {
        log.debug("Room leave request - roomId: {}, userId: {}", 
                message.getRoomId(), message.getUserId());
                
        // 세션에서 방 정보 제거
        sessionRepository.updateUserRoom(sessionId, null);
        
        // Room에서 유저 제거
        User user = User.builder()
                .userId(Long.valueOf(message.getUserId()))
                .username(message.getUsername())
                .build();
                
        roomService.leaveRoom(message.getRoomId(), user);
        
        // 퇴장 메시지 전송
        RoomChatMessage leaveMessage = RoomChatMessage.builder()
                .type(MessageType.LEAVE)
                .roomId(message.getRoomId())
                .userId(message.getUserId())
                .username(message.getUsername())
                .content(message.getUsername() + "님이 퇴장하셨습니다.")
                .timestamp(LocalDateTime.now())
                .build();
                
        messagingTemplate.convertAndSend(
            "/topic/room." + message.getRoomId(),
            leaveMessage
        );
        
        // 유저 목록 업데이트 메시지 전송
        sendUserListUpdate(message.getRoomId());
    }
    
    private void sendUserListUpdate(String roomId) {
        Set<User> users = roomService.getRoomUsers(roomId);
        
        RoomChatMessage userListMessage = RoomChatMessage.builder()
                .type(MessageType.USER_LIST)
                .roomId(roomId)
                .users(new ArrayList<>(users))
                .timestamp(LocalDateTime.now())
                .build();
                
        messagingTemplate.convertAndSend(
            "/topic/room." + roomId + ".users",
            userListMessage
        );
    }
}