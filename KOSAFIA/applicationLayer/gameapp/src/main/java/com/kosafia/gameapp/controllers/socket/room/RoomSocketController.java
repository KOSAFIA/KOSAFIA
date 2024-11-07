package com.kosafia.gameapp.controllers.socket.room;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.models.user.UserData;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Random;

@Slf4j
@Controller
@RequiredArgsConstructor
public class RoomSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;

    // 채팅 메시지를 담는 그릇이에요
    record ChatMessage(String username, String content, Integer roomKey) {}
    
    // 게임 시작 메시지를 담는 그릇이에요
    record GameStartMessage(Integer roomKey, String message) {}

    // 방에 있는 사람들 목록을 보내주는 함수에요
    public void sendUserList(Integer roomKey) {
        log.info("방 {}의 사용자 목록을 보내려고 해요", roomKey);
        Room room = roomRepository.getRoom(roomKey);
        if (room != null) {
            List<Player> players = room.getPlayers();
            messagingTemplate.convertAndSend("/topic/room.users." + roomKey, players);
            log.info("방 {}의 사용자 목록을 성공적으로 보냈어요", roomKey);
        } else {
            log.warn("앗! 방 {}을 찾을 수 없어요", roomKey);
        }
    }

    // 채팅 메시지를 받으면 처리하는 함수에요
    @MessageMapping("/room.chat.send/{roomKey}")
    public void handleChatMessage(@DestinationVariable Integer roomKey, @Payload ChatMessage chatMessage) {
        log.info("방 {}에서 채팅 메시지가 왔어요: {}", roomKey, chatMessage.content());
        Room room = roomRepository.getRoom(roomKey);
        if (room != null) {
            messagingTemplate.convertAndSend("/topic/room.chat." + roomKey, chatMessage);
            log.info("방 {}의 모든 사람들에게 채팅 메시지를 보냈어요: {}", roomKey, chatMessage);
        } else {
            log.warn("앗! 방 {}을 찾을 수 없어서 채팅 메시지를 보낼 수 없어요", roomKey);
        }
    }

    // 새로운 사람이 방에 들어왔을 때 처리하는 함수에요
    @MessageMapping("/room.user.join/{roomKey}")
    public void handleUserJoin(@DestinationVariable Integer roomKey, @Payload Player player) {
        log.info("{}님이 방 {}에 들어오려고 해요", player.getUsername(), roomKey);

        // Random rand = new Random();

        Room room = roomRepository.getRoom(roomKey);
        List<Player> players = room.getPlayers();

        if (room != null) {
            if (!players.contains(player)) {
                room.addPlayer(player.getUsername(), player.getUserEmail());
                log.info("{}님이 방 {}에 성공적으로 들어왔어요", player.getUsername(), roomKey);
                List<Player> updatedPlayers = room.getPlayers();
                
                // 디버그 로그 추가
                log.info("전송할 유저 리스트: {}", updatedPlayers);
                
                messagingTemplate.convertAndSend("/topic/room.users." + roomKey, updatedPlayers);
                log.info("방 {}의 업데이트된 유저 리스트를 전송했어요: {}", roomKey, updatedPlayers);
            } else {
                log.info("{}님은 이미 방 {}에 있어요", player.getUsername(), roomKey);
                // 이미 있어도 현재 유저 리스트를 다시 보내기
                messagingTemplate.convertAndSend("/topic/room.users." + roomKey, room.getPlayers());
            }
        } else {
            log.warn("앗! 방 {}을 찾을 수 없어요", roomKey);
        }
    }

    // 누군가 방에서 나갔을 때 처리하는 함수에요
    @MessageMapping("/room.user.leave/{roomKey}")
    public void handleUserLeave(@DestinationVariable Integer roomKey, @Payload Player player) {
        log.info("{}님이 방 {}에서 나가려고 해요", player.getUsername(), roomKey);
        Room room = roomRepository.getRoom(roomKey);
        if (room != null) {
            if (room.getPlayers().contains(player)) {
                room.removePlayer(player);
                log.info("{}님이 방 {}에서 나갔어요", player.getUsername(), roomKey);
                messagingTemplate.convertAndSend("/topic/room.users." + roomKey, room.getPlayers());
            } else {
                log.warn("{}님은 방 {}에 없어요", player.getUsername(), roomKey);
            }
        } else {
            log.warn("앗! 방 {}을 찾을 수 없어요", roomKey);
        }
    }

    // 게임 시작 신호를 받으면 처리하는 함수에요
    @MessageMapping("/room.game.start/{roomKey}")
    public void startGame(@DestinationVariable Integer roomKey, @Payload GameStartMessage startMessage) {
        log.info("방 {}에서 게임을 시작하려고 해요", roomKey);
        Room room = roomRepository.getRoom(roomKey);
        if (room != null) {
            if (room.getPlayers().size() == room.getMaxPlayers()) {
                messagingTemplate.convertAndSend("/topic/room.game.start." + roomKey, startMessage);
                log.info("방 {}의 게임이 시작되었어요!", roomKey);
            } else {
                log.warn("앗! 방 {}에 사람이 부족해서 게임을 시작할 수 없어요. 현재 {}명, 필요한 인원: {}명", 
                    roomKey, room.getPlayers().size(), room.getMaxPlayers());
            }
        } else {
            log.warn("앗! 방 {}을 찾을 수 없어요", roomKey);
        }
    }
}