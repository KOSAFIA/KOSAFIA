package com.kosafia.gameapp.controllers.socket.room;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.models.user.UserData;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;

import lombok.RequiredArgsConstructor;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class RoomSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;

    // 채팅 메시지 dto
    record ChatMessage(String sender, String content, Integer roomId) {}
    
    // 게임 시작 메시지 dto
    record GameStartMessage(Integer roomId, Boolean isStarted) {}

    // 룸 채팅 발행 (클라이언트 -> 서버)
    @MessageMapping("/room.chat.send/{roomId}")
    public void sendChat(@DestinationVariable Integer roomId, @Payload ChatMessage message) {
        // 메시지 유효성 검사
        if (message == null || message.content() == null || message.content().trim().isEmpty()) {
            System.out.println("빈 메시지는 전송할 수 없습니다.");
            return;
        }

        // 발신자 확인
        if (message.sender() == null || message.sender().trim().isEmpty()) {
            System.out.println("발신자 정보가 없습니다.");
            return;
        }

        // 메시지 전송 시도
        try {
            // 특정 룸의 구독자들에게 메시지 전송
            messagingTemplate.convertAndSend("/topic/room.chat." + roomId, message);
            System.out.println("메시지가 전송되었습니다: " + message.content());
        } catch (Exception e) {
            System.out.println("메시지 전송 중 오류 발생: " + e.getMessage());
        }
    }

    // 룸 채팅 구독 경로: /topic/room.chat.{roomId}
    // 클라이언트에서 구독: stompClient.subscribe('/topic/room.chat.' + roomId, callback)

    // 룸 유저 리스트 발행 (클라이언트 -> 서버)
    @MessageMapping("/room.users.update/{roomId}")
    public void updateUserList(@DestinationVariable Integer roomId, @Payload UserData userData) {
        Room room = roomRepository.getRoom(roomId);
        if (room != null) {
            // 유저가 이미 리스트에 있는지 확인
            if (!room.getUsers().contains(userData)) {
                room.addUser(userData);
                // 룸의 전체 유저 리스트를 구독자들에게 전송
                messagingTemplate.convertAndSend("/topic/room.users." + roomId, room.getUsers());
            } else {
                System.out.println("유저가 이미 리스트에 있습니다: " + userData.getUsername());
            }
        } else {
            System.out.println("룸을 찾을 수 없습니다: " + roomId);
        }
    }

    // 룸 유저 리스트 구독 경로: /topic/room.users.{roomId}
    // 클라이언트에서 구독: stompClient.subscribe('/topic/room.users.' + roomId, callback)

    // 유저 퇴장 처리
    @MessageMapping("/room.user.leave/{roomId}")
    public void handleUserLeave(@DestinationVariable Integer roomId, @Payload UserData userData) {
        Room room = roomRepository.getRoom(roomId);
        if (room != null) {
            // 유저가 리스트에 있는지 확인
            if (room.getUsers().contains(userData)) {
                room.removePlayer(userData);
                // 업데이트된 유저 리스트 전송
                messagingTemplate.convertAndSend("/topic/room.users." + roomId, room.getUsers());
            } else {
                System.out.println("리스트에 없는 유저입니다: " + userData.getUsername());
            }
        } else {
            System.out.println("룸을 찾을 수 없습니다: " + roomId);
        }
    }

    // 룸 시작 소켓 발행 (클라이언트 -> 서버)
    @MessageMapping("/room.game.start/{roomId}")
    public void startGame(@DestinationVariable Integer roomId, @Payload GameStartMessage startMessage) {
        Room room = roomRepository.getRoom(roomId);
        if (room != null) {
            // 최대 인원 확인
            if (room.getUsers().size() == room.getMaxUsers()) {
                // 게임 시작 메시지를 구독자들에게 전송
                messagingTemplate.convertAndSend("/topic/room.game.start." + roomId, startMessage);
                System.out.println("게임이 시작되었습니다: 룸 ID " + roomId);
            } else {
                System.out.println("게임을 시작할 수 없습니다. 현재 인원: " + room.getUsers().size() + ", 필요한 인원: " + room.getMaxUsers());
            }
        } else {
            System.out.println("룸을 찾을 수 없습니다: " + roomId);
        }
    }

    // 룸 시작 소켓 구독 경로: /topic/room.game.start.{roomId}
    // 클라이언트에서 구독: stompClient.subscribe('/topic/room.game.start.' + roomId, callback)
}