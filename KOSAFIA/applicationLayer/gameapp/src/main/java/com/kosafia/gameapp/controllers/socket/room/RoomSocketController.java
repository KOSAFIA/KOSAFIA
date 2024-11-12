package com.kosafia.gameapp.controllers.socket.room;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.models.user.UserData;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;

import jakarta.servlet.http.HttpSession;
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
    
    // 게임 시작 메시지를 담는 그릇을 수정해요
    record GameStartMessage(
        Integer roomKey, 
        String message, 
        List<Player> players,
        String gameStatus
    ) {}

    // 방에 있는 사람들 목록을 보내주는 함수에요
    public void sendPlayerList(Integer roomKey) {
        log.info("방 {}의 사용자 목록을 보내려고 해요", roomKey);
        Room room = roomRepository.getRoom(roomKey);
        if (room != null) {
            List<Player> players = room.getPlayers();
            messagingTemplate.convertAndSend("/topic/room.players." + roomKey, players);
            log.info("방 {}의 사용자 목록을 성공적으로 보냈어요", roomKey);
        } else {
            log.warn("앗! 방 {}을 찾을 수 없어요", roomKey);
        }
    }

    // 채팅 메시지를 받으면 처리하는 함수에요
    @MessageMapping("/room.chat.send/{roomKey}")
    public void handleChatMessage( @Payload ChatMessage chatMessage, @DestinationVariable("roomKey") Integer roomKey) {
        log.info("방 {}에서 채팅 메시지가 왔어요: {}", chatMessage.roomKey(), chatMessage.content());
        Room room = roomRepository.getRoom(chatMessage.roomKey());
        if (room != null) {
            messagingTemplate.convertAndSend("/topic/room.chat." + chatMessage.roomKey(), chatMessage);
            log.info("방 {}의 모든 사람들에게 채팅 메시지를 보냈어요: {}", chatMessage.roomKey(), chatMessage);
        } else {
            log.warn("앗! 방 {}을 찾을 수 없어서 채팅 메시지를 보낼 수 없어요", chatMessage.roomKey());
        }
    }

    // 새로운 사람이 방에 들어왔을 때 처리하는 함수에요
    @MessageMapping("/room.players.join/{roomKey}")
    public void handleplayerJoin( @Payload Player player , @DestinationVariable("roomKey") Integer roomKey) {
        //그지같네 왜 roomKey를 다이렉트로 못받아오지? 짜증나서 세션 쓴다 와..
        // Integer roomKey = (Integer)session.getAttribute("roomKey");
        log.debug("Received roomKey: {}", roomKey);
        log.debug("Received player data: {}", player);
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
                
                messagingTemplate.convertAndSend("/topic/room.players." + roomKey, updatedPlayers);
                log.info("방 {}의 업데이트된 유저 리스트를 전송했어요: {}", roomKey, updatedPlayers);
            } else {
                log.info("{}님은 이미 방 {}에 있어요", player.getUsername(), roomKey);
                // 이미 있어도 현재 유저 리스트를 다시 보내기
                messagingTemplate.convertAndSend("/topic/room.players." + roomKey, room.getPlayers());
            }
        } else {
            log.warn("앗! 방 {}을 찾을 수 없어요", roomKey);
        }
    }

    // 누군가 방에서 나갔을 때 처리하는 함수에요
    @MessageMapping("/room.players.leave/{roomKey}")
    public void handleplayerLeave(@Payload Player player, @DestinationVariable("roomKey") Integer roomKey) {
        log.info("{}님이 방 {}에서 나가려고 해요", player.getUsername(), roomKey);
        Room room = roomRepository.getRoom(roomKey);
        if (room != null) {
            if (room.getPlayers().contains(player)) {
                room.removePlayer(player);
                log.info("{}님이 방 {}에서 나갔어요", player.getUsername(), roomKey);
                messagingTemplate.convertAndSend("/topic/room.players." + roomKey, room.getPlayers());
            } else {
                log.warn("{}님은 방 {}에 없어요", player.getUsername(), roomKey);
            }
        } else {
            log.warn("앗! 방 {}을 찾을 수 없어요", roomKey);
        }
    }

    // 게임 시작 신호를 받으면 처리하는 함수에요 서버는 이미 게임 시작 세팅이 되었다는거고, 얘는 
    //클라이언트 플레이어들에게 브로드 캐스팅 할거에요
    @MessageMapping("/room.game.start/{roomKey}")
    public void startGame(@Payload GameStartMessage startMessage, @DestinationVariable("roomKey") Integer roomKey) {
        log.info("방 {}에서 게임 시작 소켓 메시지를 받았어요", roomKey);
        Room room = roomRepository.getRoom(roomKey);
        
        if (room != null) {
            if (room.getPlayers().size() == room.getMaxPlayers()) {
                try {
                    // 1. 현재 방의 최신 정보로 새로운 메시지 생성
                    GameStartMessage updatedMessage = new GameStartMessage(
                        room.getRoomKey(),
                        "게임이 시작되었습니다",
                        room.getPlayers(),
                        room.getGameStatus().toString()
                    );

                    // 2. 게임 시작 메시지를 모든 클라이언트에게 브로드캐스트
                    messagingTemplate.convertAndSend(
                        "/topic/room.game.start." + roomKey, 
                        updatedMessage
                    );
                    
                    log.info("방 {} 게임 시작 정보를 전송했습니다: {}", roomKey, updatedMessage);

                } catch (Exception e) {
                    log.error("게임 시작 메시지 전송 중 오류 발생:", e);
                }
            } else {
                log.warn("방 {}에 플레이어가 부족해요. 현재 {}명, 필요: {}명", 
                    roomKey, room.getPlayers().size(), room.getMaxPlayers());
            }
        } else {
            log.warn("방 {}을 찾을 수 없어요", roomKey);
        }
    }
}