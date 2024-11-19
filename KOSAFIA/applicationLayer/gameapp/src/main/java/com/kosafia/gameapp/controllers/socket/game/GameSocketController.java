package com.kosafia.gameapp.controllers.socket.game;

import com.kosafia.gameapp.controllers.socket.game.GameSocketController.GameEventType;
import com.kosafia.gameapp.models.gameroom.*;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Controller
public class GameSocketController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private RoomRepository roomRepository;
    // private final Map<Integer, Thread> roomTimers = new ConcurrentHashMap<>();

    @MessageMapping("/game.chat/{roomKey}")
    public void handleChat(@DestinationVariable("roomKey") Integer roomKey, @Payload ChatMessage message) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) return;
            sendChatMessage(room, message);
        } catch (Exception e) {
            log.error("메시지 처리 중 오류:", e);
        }
    }
    @MessageMapping("/game.chat.mafia/{roomKey}")
    public void handleChatMafia(@DestinationVariable("roomKey") Integer roomKey, @Payload ChatMessage message) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) return;
            sendChatMessage(room, message);
        } catch (Exception e) {
            log.error("메시지 처리 중 오류:", e);
        }
    }

    @MessageMapping("/game.night.result/{roomKey}")
    public void handleNightResult(@DestinationVariable("roomKey") Integer roomKey) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) return;
            processNightResult(room);
            updateGameState(room, GameStatus.DAY);
        } catch (Exception e) {
            log.error("밤 결과 처리 중 오류 발생:", e);
        }
    }


    @MessageMapping("/game.mafia.target/{roomKey}")
    public void handleMafiaTarget(@DestinationVariable("roomKey") Integer roomKey, @Payload MafiaTargetMessage targetMessage) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (!validateMafiaTargetSelection(room, targetMessage)) return;
            broadcastMafiaTarget(room, targetMessage);
        } catch (Exception e) {
            log.error("마피아 타겟 처리 중 오류 발생:", e);
        }
    }

    @MessageMapping("/game.start/{roomKey}")
    public void handleGameStart(@DestinationVariable("roomKey") Integer roomKey) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                log.warn("[게임 시작 실패] 방을 찾을 수 없음 - 방번호: {}", roomKey);
                return;
            }

            room.startGame(this);
            
            messagingTemplate.convertAndSend(
                "/topic/game.start." + roomKey,
                new GameStartResponse(true, "게임이 시작되었습니다.", room.getGameStatus().toString())
            );
            
            log.info("[게임 시작 완료] 방번호: {}", roomKey);
        } catch (Exception e) {
            log.error("[게임 시작 처리 중 오류] 방번호: {}, 오류: {}", roomKey, e.getMessage(), e);
        }
    }
    record GameStartResponse(boolean success, String message, String gameStatus) {}
    private void initializeGame(Room room) {
        try {
            room.setGameStatus(GameStatus.NIGHT);
            int initialTime = getDefaultTime(GameStatus.NIGHT);
            log.info("[게임 초기화] 방: {}, 초기 시간 설정: {}초", room.getRoomKey(), initialTime);
            
            room.setCurrentTime(initialTime);
            room.setTurn(1);
            
            // 상태 변경 후 즉시 브로드캐스트
            broadcastGameState(room);
        } catch (Exception e) {
            log.error("[게임 초기화 중 오류] 방: {}, 오류: {}", room.getRoomKey(), e.getMessage(), e);
            throw e; // 상위 핸들러에서 처리하도록 재던지기
        }
    }
    private void broadcastTimerState(Room room) {
        try {
            TimerResponse timerResponse = new TimerResponse(
                room.getCurrentTime(),
                room.getGameStatus().toString(),
                true,
                "게임 타이머가 초기화되었습니다."
            );
            
            messagingTemplate.convertAndSend(
                "/topic/game.timer." + room.getRoomKey(),
                timerResponse
            );
            
            log.debug("[타이머 상태 브로드캐스트] 방: {}, 시간: {}초", 
                room.getRoomKey(), room.getCurrentTime());
        } catch (Exception e) {
            log.error("[타이머 상태 브로드캐스트 실패] 방: {}, 오류: {}", 
                room.getRoomKey(), e.getMessage());
        }
    }
    // private void startRoomTimer(Integer roomKey) {
    //     log.info("[타이머 시작 요청] 방번호: {}", roomKey);
        
    //     // 이전 타이머가 있다면 중지
    //     stopRoomTimer(roomKey);
        
    //     Room room = roomRepository.getRoom(roomKey);
    //     if (room == null || room.getCurrentTime() <= 0) {
    //         log.error("[타이머 시작 실패] 잘못된 방 상태 - 방: {}", roomKey);
    //         return;
    //     }

    //     Thread timerThread = new Thread(() -> runTimer(roomKey));
    //     timerThread.setName("Timer-" + roomKey);
    //     timerThread.start();
    //     roomTimers.put(roomKey, timerThread);
        
    //     log.info("[타이머 스레드 시작] 방: {}, 스레드: {}, 초기시간: {}초", 
    //         roomKey, timerThread.getName(), room.getCurrentTime());
    // }


    @MessageMapping("/game.vote/{roomKey}")
    public void handleVote(@DestinationVariable("roomKey") Integer roomKey, @Payload VoteMessage voteMessage) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) return;
            processVote(room, voteMessage);
            broadcastVoteStatus(room);
            sendVoteNotification(room, voteMessage);
        } catch (Exception e) {
            log.error("투표 처리 중 오류 발생:", e);
        }
    }
    @MessageMapping("/game.vote.result/{roomKey}")
    public void handleVoteResult(@DestinationVariable("roomKey") Integer roomKey) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) return;
            Player targetPlayer = room.getMostVotedPlayer();
            processVoteResult(room, targetPlayer);
            updateGameState(room, GameStatus.FINALVOTE);
        } catch (Exception e) {
            log.error("투표 결과 처리 중 오류 발생:", e);
        }
    }
    


    @MessageMapping("/game.finalvote.result/{roomKey}")
    public void handleFinalVoteResult(@DestinationVariable("roomKey") Integer roomKey) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) return;
            processFinalVoteResult(room);
            updateGameState(room, GameStatus.NIGHT);
        } catch (Exception e) {
            log.error("최종 투표 결과 처리 중 오류 발생:", e);
        }
    }

    @MessageMapping("/game.players.update/{roomKey}")
    public void handlePlayerUpdate(@DestinationVariable("roomKey") Integer roomKey, @Payload Player player) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            updatePlayerStatus(room, player);
            broadcastPlayerUpdate(room, true, "플레이어 상태가 업데이트되었습니다.");
        } catch (Exception e) {
            log.error("플레이어 상태 업데이트 실패 - 방: " + roomKey, e);
            handlePlayerUpdateError(roomKey, e);
        }
    }

    @MessageMapping("/game.timer/{roomKey}")
    public void handleTimer(@DestinationVariable("roomKey") Integer roomKey) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null || !room.isPlaying()) return;
            sendTimerUpdate(room);
        } catch (Exception e) {
            log.error("타이머 처리 중 오류:", e);
        }
    }

    @MessageMapping("/game.timer.modify/{roomKey}")
    public void handleTimerModification(@DestinationVariable("roomKey") Integer roomKey, @Payload TimerModifyRequest request) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            Player player = validateTimerModification(room, request);
            modifyGameTimer(room, request.adjustment());
            broadcastTimerUpdate(room);
        } catch (Exception e) {
            log.error("타이머 수정 실패:", e);
            handleTimerError(roomKey, e);
        }
    }

    @MessageMapping("/game.players.join/{roomKey}")
    public void handlePlayerJoin(@DestinationVariable("roomKey") Integer roomKey, @Payload Player playerData) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) return;
            if (isHostJoining(room, playerData)) {
                initializeGameForHost(room);
            }
            broadcastPlayersUpdate(room);
        } catch (Exception e) {
            log.error("플레이어 입장 처리 중 오류:", e);
        }
    }

    @MessageMapping("/game.system/{roomKey}")
    public void handleSystemMessage(@DestinationVariable("roomKey") Integer roomKey, @Payload ChatMessage message) {
        try {
            validateAndSendSystemMessage(roomKey, message);
        } catch (Exception e) {
            log.error("시스템 메시지 처리 중 오류:", e);
        }
    }

    private void sendChatMessage(Room room, ChatMessage message) {
        String destination = getChatDestination(room, message.type());
        if (destination != null) {
            messagingTemplate.convertAndSend(destination, message);
            if (message.soundUrl() != null) {
                broadcastSound(room.getRoomKey(), message.soundUrl());
            }
        }
    }

    private String getChatDestination(Room room, String type) {
        return switch (type) {
            case "MAFIA" -> room.getGameStatus() == GameStatus.NIGHT ? "/topic/game.chat.mafia." + room.getRoomKey() : null;
            case "SYSTEM", "EVENT" -> "/topic/game.chat." + room.getRoomKey();
            default -> room.getGameStatus() != GameStatus.NIGHT ? "/topic/game.chat." + room.getRoomKey() : null;
        };
    }

    private void processNightResult(Room room) {
        Player killedPlayer = findTargetPlayer(room, Role.MAFIA);
        Player savedPlayer = findTargetPlayer(room, Role.DOCTOR);
        handlePlayerDeath(room, killedPlayer, "마피아 공격");
        if (killedPlayer != null && savedPlayer != null && killedPlayer.getPlayerNumber().equals(savedPlayer.getPlayerNumber())) {
            handlePlayerHeal(room);
        }
    }

    private boolean validateMafiaTargetSelection(Room room, MafiaTargetMessage targetMessage) {
        if (room == null) return false;
        Player mafia = room.getPlayerByPlayerNumber(targetMessage.mafiaId());
        if (mafia == null || !mafia.getRole().equals(Role.MAFIA)) return false;
        Player target = room.getPlayerByPlayerNumber(targetMessage.targetId());
        return target != null;
    }

    private void broadcastMafiaTarget(Room room, MafiaTargetMessage targetMessage) {
        messagingTemplate.convertAndSend("/topic/game.mafia.target." + room.getRoomKey(), targetMessage);
    }

    private void processVote(Room room, VoteMessage voteMessage) {
        room.vote(voteMessage.voterId(), voteMessage.targetId());
    }

    private void broadcastVoteStatus(Room room) {
        messagingTemplate.convertAndSend(
            "/topic/game.vote." + room.getRoomKey(),
            new VoteStatusResponse(room.getVoteStatus())
        );
    }

    private void sendVoteNotification(Room room, VoteMessage voteMessage) {
        Player voter = room.getPlayerByPlayerNumber(voteMessage.voterId());
        Player target = room.getPlayerByPlayerNumber(voteMessage.targetId());
        if (voter != null && target != null) {
            sendGameEventMessage(room, GameEventType.VOTE, 
                String.format("%s님이 %s님을 지목하였습니다.", 
                voter.getUsername(), target.getUsername()), 
                target);
        }
    }

    private void processVoteResult(Room room, Player targetPlayer) {
        StringBuilder content = new StringBuilder("투표 결과\n");
        appendVoteResults(content, room.getVoteStatus(), room);
        if (targetPlayer != null) {
            targetPlayer.setVoteTarget(true);
            content.append("\n").append(targetPlayer.getUsername())
                  .append("님이 최다 득표되었습니다. 최후의 변론을 시작합니다.");
            sendGameEventMessage(room, GameEventType.VOTE, content.toString(), targetPlayer);
        } else {
            content.append("\n투표가 동률이거나 없어 넘어갑니다.");
            sendGameEventMessage(room, GameEventType.VOTE, content.toString(), null);
        }
    }

    private void appendVoteResults(StringBuilder content, Map<Integer, Integer> voteStatus, Room room) {
        voteStatus.forEach((playerId, count) -> {
            Player player = room.getPlayerByPlayerNumber(playerId);
            if (player != null) {
                content.append(player.getUsername())
                      .append(": ")
                      .append(count)
                      .append("표\n");
            }
        });
    }

    private void processFinalVoteResult(Room room) {
        Player executedPlayer = room.processFinalVoteResult();
        int agreeVotes = room.getAgreeVotes();
        int disagreeVotes = room.getDisagreeVotes();
        String resultMessage = formatFinalVoteResult(agreeVotes, disagreeVotes, executedPlayer != null ? executedPlayer.getUsername() : null);
        sendGameEventMessage(room, 
            executedPlayer != null ? GameEventType.EXECUTION : GameEventType.SURVIVE,
            resultMessage, 
            executedPlayer);
    }

    private String formatFinalVoteResult(int agreeVotes, int disagreeVotes, String executedPlayerName) {
        return String.format(
            "최종 투표 결과\n찬성: %d표\n반대: %d표\n\n%s",
            agreeVotes,
            disagreeVotes,
            executedPlayerName != null ? 
                executedPlayerName + "님이 처형되었습니다." :
                "투표 대상이 살아남았습니다."
        );
    }

    private void updateGameState(Room room, GameStatus newStatus) {
        room.setGameStatus(newStatus);
        room.setCurrentTime(getDefaultTime(newStatus));
        broadcastGameState(room);
        // if (newStatus != GameStatus.NONE) {
        //     startRoomTimer(room.getRoomKey());
        // }
    }

    private void updatePlayerStatus(Room room, Player player) {
        Player serverplayer = room.getPlayerByPlayerNumber(player.getPlayerNumber());
        if (serverplayer != null) {
            serverplayer.setAlive(player.isAlive());
            serverplayer.setRole(player.getRole());
        }

    }


    private void broadcastPlayerUpdate(Room room, boolean success, String message) {
        PlayerUpdateResponse response = new PlayerUpdateResponse(
            room.getGameStatus().toString(),
            room.getPlayers(),
            success,
            message
        );
        messagingTemplate.convertAndSend("/topic/game.players." + room.getRoomKey(), response);
    }


    private void handlePlayerUpdateError(Integer roomKey, Exception e) {
        PlayerUpdateResponse errorResponse = new PlayerUpdateResponse(
            null, null, false, "플레이어 상태 업데이트 실패: " + e.getMessage()
        );
        messagingTemplate.convertAndSend("/topic/game.players." + roomKey, errorResponse);
    }

    private Player validateTimerModification(Room room, TimerModifyRequest request) {
        if (room == null) {
            throw new RuntimeException("방을 찾을 수 없습니다");
        }
        Player player = room.getPlayerByPlayerNumber(request.playerNumber());
        if (player == null || !player.isAlive()) {
            throw new RuntimeException("유효하지 않은 플레이어입니다");
        }
        return player;
    }

    private void modifyGameTimer(Room room, int adjustment) {
        int newTime = Math.max(0, room.getCurrentTime() + adjustment);
        room.setCurrentTime(newTime);
    }

    public void broadcastTimerUpdate(Room room) {
        try {
            TimerResponse response = new TimerResponse(
                room.getCurrentTime(),
                room.getGameStatus().toString(),
                true,
                "타이머 업데이트"
            );
            
            messagingTemplate.convertAndSend(
                "/topic/game.timer." + room.getRoomKey(),
                response
            );
        } catch (Exception e) {
            log.error("타이머 업데이트 브로드캐스트 실패", e);
        }
    }


    private String formatTimerMessage(int playerNumber, int adjustment) {
        return String.format("Player %d가 시간을 %d초 %s하였습니다.", 
            playerNumber,
            Math.abs(adjustment),
            adjustment > 0 ? "증가" : "감소"
        );
    }

    private void handleTimerError(Integer roomKey, Exception e) {
        TimerResponse errorResponse = new TimerResponse(
            null, null, false, "타이머 수정 실패: " + e.getMessage()
        );
        messagingTemplate.convertAndSend("/topic/game.timer." + roomKey, errorResponse);
    }

    private boolean isHostJoining(Room room, Player playerData) {
        return playerData.getUsername().equals(room.getHostName());
    }

    private void initializeGameForHost(Room room) {
        room.setGameStatus(GameStatus.NIGHT);
        room.setCurrentTime(getDefaultTime(GameStatus.NIGHT));
        room.setTurn(1);
        broadcastGameState(room);
        // startRoomTimer(room.getRoomKey());
    }

    public void broadcastGameState(Room room) {
        try {
            GameStateResponse response = new GameStateResponse(
                room.getGameStatus().toString(),
                room.getPlayers(),
                room.getCurrentTime(),
                room.getTurn(),
                true,
                room.getGameStatus().toString() + " 시간이 시작되었습니다."
            );
            
            messagingTemplate.convertAndSend(
                "/topic/game.state." + room.getRoomKey(),
                response
            );
        } catch (Exception e) {
            log.error("게임 상태 브로드캐스트 실패", e);
        }
    }
    private void broadcastPlayersUpdate(Room room) {
        messagingTemplate.convertAndSend(
            "/topic/game.players." + room.getRoomKey(),
            room.getPlayers()
        );
    }

    private void validateAndSendSystemMessage(Integer roomKey, ChatMessage message) {
        if (!isValidSystemMessage(message)) {
            log.error("잘못된 시스템 메시지 형식: {}", message);
            return;
        }
        broadcastSystemMessage(roomKey, message);
    }

    private boolean isValidSystemMessage(ChatMessage message) {
        return message != null &&
               "SYSTEM".equals(message.role()) &&
               message.content() != null &&
               !message.content().trim().isEmpty();
    }

    private void broadcastSystemMessage(Integer roomKey, ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/game.chat." + roomKey, message);
    }

    private void broadcastSound(Integer roomKey, String soundUrl) {
        messagingTemplate.convertAndSend(
            "/topic/game.sound." + roomKey,
            Map.of("sound", soundUrl)
        );
    }

    private void sendGameEventMessage(Room room, GameEventType eventType, String content, Player targetPlayer) {
        ChatMessage.ChatMessageBuilder messageBuilder = ChatMessage.builder()
            .content(content)
            .playerNumber(0)
            .username("System")
            .role("SYSTEM")
            .type(eventType.name())
            .gameStatus(room.getGameStatus().toString())
            .roomKey(room.getRoomKey());

        switch (eventType) {
            case DEATH -> {
                messageBuilder
                    .imageUrl("/img/death.png")
                    .soundUrl("/sound/death.mp3");
            }
            case HEAL -> {
                messageBuilder
                    .imageUrl("/img/heal.png")
                    .soundUrl("/sound/heal.mp3");
            }
            case VOTE -> {
                if (targetPlayer != null) {
                    messageBuilder.imageUrl("/img/vote-target.png");
                }
            }
            case EXECUTION -> {
                messageBuilder
                    .imageUrl("/img/execution.png")
                    .soundUrl("/sound/death.mp3");
            }
            case SURVIVE -> {
                messageBuilder
                    .imageUrl("/img/survive.png")
                    .soundUrl("/sound/survive.mp3");
            }
        }

        broadcastEventMessage(room, messageBuilder.build());
    }

    enum GameEventType {
        DEATH,
        HEAL,
        VOTE,
        EXECUTION,
        SURVIVE
    }

    private void handlePlayerDeath(Room room, Player deadPlayer, String cause) {
        String deathMessage = formatDeathMessage(deadPlayer, cause);
        sendGameEventMessage(room, GameEventType.DEATH, deathMessage, deadPlayer);
    }

    private void handlePlayerHeal(Room room) {
        sendGameEventMessage(
            room,
            GameEventType.HEAL,
            "의사가 누군가를 치료했습니다.",
            null
        );
    }

    private String formatDeathMessage(Player deadPlayer, String cause) {
        return String.format("%s님이 %s으로 사망하셨습니다.", 
            deadPlayer.getUsername(), 
            cause
        );
    }

    private void broadcastEventMessage(Room room, ChatMessage message) {
        String destination = "/topic/game.chat." + room.getRoomKey();
        messagingTemplate.convertAndSend(destination, message);
        if (message.soundUrl() != null) {
            broadcastSound(room.getRoomKey(), message.soundUrl());
        }
    }


    private void runTimer(Integer roomKey) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                log.warn("[타이머 실행 실패] 방을 찾을 수 없음 - 방번호: {}", roomKey);
                return;
            }

            log.info("[타이머 실행 시작] 방: {}, 상태: {}, 초기시간: {}초", 
                roomKey, room.getGameStatus(), room.getCurrentTime());

            while (room != null && room.getCurrentTime() > 0) {
                sendTimerUpdate(room);
                log.info("[타이머 카운트] 방: {}, 상태: {}, 남은시간: {}초", 
                    roomKey, room.getGameStatus(), room.getCurrentTime());
                
                Thread.sleep(1000);
                room.setCurrentTime(room.getCurrentTime() - 1);
                room = roomRepository.getRoom(roomKey);
            }
            
            if (room != null) {
                log.info("[타이머 종료] 방: {}, 최종상태: {}", roomKey, room.getGameStatus());
                sendTimerEnd(room);
            }
        } catch (InterruptedException e) {
            log.info("[타이머 중단] 방: {}, 원인: 인터럽트", roomKey);
        } catch (Exception e) {
            log.error("[타이머 오류] 방: {}, 원인: {}", roomKey, e.getMessage(), e);
        }
    }

    private void stopRoomTimer(Integer roomKey) {
        // Optional.ofNullable(roomTimers.remove(roomKey))
        //        .ifPresent(Thread::interrupt);
    }

    private void sendTimerUpdate(Room room) {
        log.debug("타이머 업데이트 전송 - 방: {}, 시간: {}초", 
            room.getRoomKey(), room.getCurrentTime());
        
        messagingTemplate.convertAndSend(
            "/topic/game.timer." + room.getRoomKey(),
            new TimerResponse(
                room.getCurrentTime(),
                room.getGameStatus().toString(),
                true,
                "시간 업데이트"
            )
        );
    }

    private void sendTimerEnd(Room room) {
        messagingTemplate.convertAndSend(
            "/topic/game.timer." + room.getRoomKey(),
            new TimerResponse(
                0,
                room.getGameStatus().toString(),
                true,
                "타이머 종료"
            )
        );
    }

    private Player findTargetPlayer(Room room, Role role) {
        return room.getPlayers().stream()
            .filter(p -> p.getRole() == role && p.getTarget() != null)
            .findFirst()
            .map(player -> room.getPlayerByPlayerNumber(player.getTarget()))
            .orElse(null);
    }

    private int getDefaultTime(GameStatus status) {
        return switch (status) {
            case NIGHT -> 30;
            case DELAY -> 5;
            case DAY -> 60;
            case VOTE -> 30;
            case FINALVOTE -> 15;
            default -> 0;
        };
    }

    //클라에서 다음 타이머 시작 요청은 클라가 하게 냅둬 좀
    // private void handleTimerEnd(Room room) {
    //     switch (room.getGameStatus()) {
    //         case NIGHT -> updateGameState(room, GameStatus.DAY);
    //         case DAY -> updateGameState(room, GameStatus.VOTE);
    //         case VOTE -> updateGameState(room, GameStatus.FINALVOTE);
    //         case FINALVOTE -> updateGameState(room, GameStatus.NIGHT);
    //         default -> log.warn("알 수 없는 게임 상태: {}", room.getGameStatus());
    //     }
    // }
}