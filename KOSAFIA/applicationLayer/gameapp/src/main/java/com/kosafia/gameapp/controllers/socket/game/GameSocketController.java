package com.kosafia.gameapp.controllers.socket.game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;
import com.kosafia.gameapp.models.gameroom.Room;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;

import com.kosafia.gameapp.services.game.GameService;

import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Controller
public class GameSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    GameService gameService;

    // 각 방의 타이머를 관리할 Thread Map
    private final Map<Integer, Thread> roomTimers = new ConcurrentHashMap<>();

    @MessageMapping("/game.chat.mafia/{roomKey}")
    public void handleMafiaChat(
            @DestinationVariable("roomKey") Integer roomKey,
            @Payload ChatMessage message) {
        log.info("마피아 채팅 메시지 수신 - 방: {}, 메시지: {}", roomKey, message);
        handleGameChat(roomKey, message);
    }

    @MessageMapping("/game.chat/{roomKey}")
    public void handleNormalChat(
            @DestinationVariable("roomKey") Integer roomKey,
            @Payload ChatMessage message) {
        log.info("일반 채팅 메시지 수신 - 방: {}, 메시지: {}", roomKey, message);
        handleGameChat(roomKey, message);
    }

    // 채팅 메시지 처리 - @Payload 어노테이션 추가 및 디버그 로그 추가
    @MessageMapping("/game.chat.send/{roomKey}")
    public void handleGameChat(@DestinationVariable("roomKey") Integer roomKey,
            @Payload ChatMessage message) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                log.error("방을 찾을 수 없음: {}", roomKey);
                return;
            }

            // 밤에는 마피아 채팅만 허용
            if (room.getGameStatus() == GameStatus.NIGHT) {
                if ("MAFIA".equals(message.role())) {
                    log.info("마피아 채팅 전송 - 방: {}", roomKey);
                    messagingTemplate.convertAndSend(
                            "/topic/game.chat.mafia." + roomKey,
                            message);
                }
            } else {
                // 낮이나 투표 시간에는 모든 채팅 허용
                log.info("일반 채팅 전송 - 방: {}", roomKey);
                messagingTemplate.convertAndSend(
                        "/topic/game.chat." + roomKey,
                        message);
            }
        } catch (Exception e) {
            log.error("채팅 메시지 처리 중 오류 발생:", e);
        }
    }

    // 마피아가 타겟 선택했을 때
    @MessageMapping("/game.mafia.target/{roomKey}")
    public void handleMafiaTarget(
            @DestinationVariable("roomKey") Integer roomKey,
            @Payload MafiaTargetMessage targetMessage) {
        try {
            log.info("마피아 타겟 설정 요청 - 방: {}, 마피아: {}, 타겟: {}",
                    roomKey, targetMessage.mafiaId(), targetMessage.targetId());

            // 방 존재 여부 확인
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                log.error("방을 찾을 수 없음: {}", roomKey);
                return;
            }

            // 마피아 플레이어 확인
            Player mafia = room.getPlayerByPlayerNumber(targetMessage.mafiaId());
            if (mafia == null || !mafia.getRole().equals(Role.MAFIA)) {
                log.error("유효하지 않은 마피아 플레이어: {}", targetMessage.mafiaId());
                return;
            }

            // 타겟 플레이어 확인
            Player target = room.getPlayerByPlayerNumber(targetMessage.targetId());
            if (target == null) {
                log.error("유효하지 않은 타겟 플레이어: {}", targetMessage.targetId());
                return;
            }

            // 같은 방의 다른 마피아들에게 타겟 정보 전달
            log.info("마피아 타겟 정보 브로드캐스트 - 방: {}", roomKey);
            messagingTemplate.convertAndSend(
                    "/topic/game.mafia.target." + roomKey,
                    targetMessage);

            log.info("마피아 타겟 설정 완료 - 방: {}", roomKey);
        } catch (Exception e) {
            log.error("마피아 타겟 처리 중 오류 발생:", e);
        }
    }

    // 게임 상태 변경 알림(안쓸 예정인데... 확장될수도 있지 않을까. 쓰면 실시간 처리 가능한데 로직이 복잡해지겠지)
    @MessageMapping("/game.state.change/{roomKey}")
    public void handleGameStateChange(@DestinationVariable("roomKey") Integer roomKey,
            @Payload GameStateMessage stateMessage) {
        log.info("게임 상태 변경: {}", stateMessage);

        // 모든 플레이어에게 새로운 게임 상태 전달
        messagingTemplate.convertAndSend(
                "/topic/game.state." + roomKey,
                stateMessage);
    }

    // 채팅 메시지 형식 게임 중에 받아야할 채팅 객체,
    // 일반 룸채팅과 다른건 역할과 현재 게임 상태값이 포함되어야함.
    record ChatMessage(
            String username,
            String content,
            String gameStatus,
            String role,
            Integer roomKey,
            Integer playerNumber,
            boolean isSystemMessage) {
    }

    // 마피아 타겟 메시지 형식 마피아가 암살 시도 할때 어떤 형태로 메시지를 보내는지
    record MafiaTargetMessage(
            Integer mafiaId,
            Integer targetId,
            Integer roomKey) {
    }

    // 게임 상태 메시지 형식 게임 상태 변경 알림 메시지 형식 ((일단 안쓸 예정이지 않을까?))
    record GameStateMessage(
            String gameStatus,
            List<Player> players) {
    }

    // 타이머 시작 메서드
    private void startRoomTimer(Integer roomKey) {
        stopRoomTimer(roomKey); // 기존 타이머 중지

        Thread timerThread = new Thread(() -> {
            try {
                Room room = roomRepository.getRoom(roomKey);
                if (room == null)
                    return;

                while (room != null && room.getCurrentTime() > 0) {
                    // TimerResponse 객체로 전송
                    TimerResponse response = new TimerResponse(
                            room.getCurrentTime(),
                            room.getGameStatus().toString(),
                            true,
                            "시간 업데이트");

                    messagingTemplate.convertAndSend(
                            "/topic/game.timer." + roomKey,
                            response);

                    Thread.sleep(1000);
                    room.setCurrentTime(room.getCurrentTime() - 1);
                }

                // 타이머 종료 시 0 전송
                TimerResponse endResponse = new TimerResponse(
                        0,
                        room.getGameStatus().toString(),
                        true,
                        "타이머 종료");
                messagingTemplate.convertAndSend("/topic/game.timer." + roomKey, endResponse);

            } catch (InterruptedException e) {
                log.info("타이머 중단됨 - 방: {}", roomKey);
            }
        });

        timerThread.start();
        roomTimers.put(roomKey, timerThread);
    }

    // 타이머 중지 메서드
    private void stopRoomTimer(Integer roomKey) {
        Thread timer = roomTimers.remove(roomKey);
        if (timer != null) {
            timer.interrupt();
        }
    }

    // 게임 상태 업데이트 메서드
    @MessageMapping("/game.state.update/{roomKey}")
    public void handleGameStateUpdate(
            @DestinationVariable("roomKey") Integer roomKey,
            @Payload GameStateUpdateRequest request) {
        log.info("게임 상태 업데이트 요청 - 방: {}, 상태: {}", roomKey, request.gameStatus());

        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null)
                return;

            GameStatus newStatus = GameStatus.valueOf(request.gameStatus());

            room.setGameStatus(newStatus);

            // 새로운 상태에 맞는 초기 시간 설정
            int initialTime = room.getDefaultTimes().get(newStatus);
            room.setCurrentTime(initialTime);


            String imageUrl = null;
            
            if (newStatus.toString() == "NIGHT" || newStatus.toString() == "DAY") {
                imageUrl = "/img/change_" + newStatus + ".jpeg";
            }
            // gameService.broadcastGameStatus(roomKey, imageUrl);

            // 상태 변경 알림
            messagingTemplate.convertAndSend("/topic/game.state." + roomKey,
                    new GameStateResponse(
                            newStatus.toString(),
                            room.getPlayers(),
                            initialTime,
                            room.getTurn(),
                            true,
                            newStatus.toString() + " 시간이 시작되었습니다.", imageUrl));




            startRoomTimer(roomKey);

        } catch (Exception e) {
            log.error("게임 상태 업데이트 중 오류:", e);
        }
    }

    // 게임 상태 업데이트 요청 객체
    record GameStateUpdateRequest(String gameStatus, Player player) {
    }

    // 플레이어 상태 업데이트 브로드캐스트
    @MessageMapping("/game.players.update/{roomKey}")
    public void broadcastPlayerUpdate(
            @DestinationVariable("roomKey") Integer roomKey,
            @Payload PlayerUpdateRequest request) {
        try {
            log.info("플레이어 상태 업데이트 시작 - 방: {}, 요청: {}", roomKey, request);

            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                throw new RuntimeException("방을 찾을 수 없습니다: " + roomKey);
            }

            Player player = room.getPlayerByPlayerNumber(request.playerNumber());
            if (player == null) {
                throw new RuntimeException("플레이어를 찾을 수 없습니다: " + request.playerNumber());
            }

            // 플레이어 상태 업데이트
            if (request.isAlive() != null)
                player.setAlive(request.isAlive());
            if (request.role() != null)
                player.setRole(Role.valueOf(request.role()));

            // 응답 생성 및 전송
            PlayerUpdateResponse response = new PlayerUpdateResponse(
                    room.getGameStatus().toString(),
                    room.getPlayers(),
                    true,
                    "플레이어 상태가 업데이트되었습니다.");

            log.info("플레이어 상태 브로드캐스트 전송 - 방: {}, 응답: {}", roomKey, response);
            messagingTemplate.convertAndSend("/topic/game.players." + roomKey, response);

        } catch (Exception e) {
            log.error("플레이어 상태 업데이트 실패 - 방: " + roomKey, e);
            PlayerUpdateResponse errorResponse = new PlayerUpdateResponse(
                    null, null, false,
                    "플레이어 상태 업데이트 실패: " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/game.players." + roomKey, errorResponse);
        }
    }

    // 플레이어 상태 업데이트 요청 객체
    record PlayerUpdateRequest(
            Integer playerNumber,
            Boolean isAlive,
            String role) {
    }

    // 플레이어 업데이트 응답 형식
    record PlayerUpdateResponse(
            String gameStatus,
            List<Player> players,
            boolean success,
            String message) {
    }

    // 응답 형식 추가
    record GameStateResponse(
            String gameStatus,
            List<Player> players,
            Integer currentTime, // 타이머 정보 추가
            Integer turn, // 일차 정보 추가
            boolean success,
            String message,
            String imageUrl) {
    }

    @MessageMapping("/game.vote/{roomKey}")
    public void handleVote(
            @DestinationVariable("roomKey") Integer roomKey,
            @Payload VoteMessage voteMessage) {
        try {
            log.info("투표 메시지 수신 - 방: {}, 투표자: {}, 타겟: {}",
                    roomKey, voteMessage.voterId(), voteMessage.targetId());

            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                log.error("방을 찾을 수 없음: {}", roomKey);
                return;
            }

            // 투표 처리 (이전 투표 취소 및 새로운 투표 반영)
            room.vote(voteMessage.voterId(), voteMessage.targetId());

            // 투표 현황 브로드캐스트
            VoteStatusResponse response = new VoteStatusResponse(room.getVoteStatus());
            messagingTemplate.convertAndSend(
                    "/topic/game.vote." + roomKey,
                    response);

            log.info("투표 현황 전송 완료 - 방: {}, 현황: {}", roomKey, room.getVoteStatus());
        } catch (Exception e) {
            log.error("투표 처리 중 오류 발생:", e);
        }
    }

    // 투표 메시지 형식
    record VoteMessage(
            Integer voterId, // 투표한 사람
            Integer targetId, // 투표 대상
            Integer roomKey // 방 번호
    ) {
    }

    // 투표 현황 응답 형식
    record VoteStatusResponse(
            Map<Integer, Integer> voteStatus // { targetId: 투표수 }
    ) {
    }

    @MessageMapping("/game.vote.result/{roomKey}")
    public void handleVoteResult(
            @DestinationVariable("roomKey") Integer roomKey,
            @Payload VoteResultRequest request) {

        String resultMsg = null;

        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null)
                return;

            // 최다 득표자 찾기
            Player mostVotedPlayer = room.getMostVotedPlayer();
            // 최다 득표자가 있으면 최종 투표 대상으로 설정
            if (mostVotedPlayer != null) {
                mostVotedPlayer.setVoteTarget(true);
                resultMsg = "최다 득표자인 " + mostVotedPlayer.getUsername() + " 님이 최후 변론을 시작합니다";
                log.info("최종 투표 대상자로 설정됨: {}", mostVotedPlayer);
            } else {
                // 없으면 최종 투표 대상 초기화
                room.getPlayers().forEach(player -> player.setVoteTarget(false));
                resultMsg = "투표 결과 최다 득표자는 없습니다. 다음날 밤으로 넘어갑니다";
            }
            // 투표 결과 브로드캐스트
            VoteResultResponse response = new VoteResultResponse(
                    mostVotedPlayer,
                    room.getVoteStatus(),
                    true,
                    null);

            messagingTemplate.convertAndSend(
                    "/topic/game.vote.result." + roomKey,
                    response);
            // 이거 받은 쪽에서 결과 처리로 게임 스테이트 업데이트 처리를 다르게 하자. 그게 맞다

            messagingTemplate.convertAndSend(
                    "/topic/game.players." + roomKey,
                    room.getPlayers());

            // 시스템 메시지 보내기 전에 음...
            messagingTemplate.convertAndSend("/topic/game.system." + roomKey, new SystemMessage(
                    "SYSTEM",
                    resultMsg,
                    room.getGameStatus().toString(),
                    roomKey,
                    0,
                    true));

            room.clearVotes();

        } catch (Exception e) {
            log.error("투표 결과 처리 실패:", e);
        }
    }

    record VoteResultRequest(
            Map<Integer, Integer> voteStatus) {
    }

    record VoteResultResponse(
            Player targetPlayer,
            Map<Integer, Integer> voteResult,
            boolean success,
            String message) {
    }

    // 최종 투표 결과 처리
    @MessageMapping("/game.finalvote.result/{roomKey}")
    public void handleFinalVoteResult(
            @DestinationVariable("roomKey") Integer roomKey) {
        String stageImageUrl = null;

        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) return;

            log.info("최종 투표 결과 처리 시작 - 방: {}, 현재 상태: {}", roomKey, room.getGameStatus());
            
            Player executedPlayer = room.processFinalVoteResult();
            log.info("processFinalVoteResult 완료 - 방: {}, 처형된 플레이어: {}", roomKey, 
                executedPlayer != null ? executedPlayer.getUsername() : "없음");
            
            room.clearVotes();
            log.info("투표 초기화 완료 - 방: {}, 현재 상태: {}", roomKey, room.getGameStatus());
            
            String resultMessage = executedPlayer != null ? 
                executedPlayer.getUsername() + "님이 처형되었습니다." : 
                "투표 결과 처형되지 않았습니다.";
            
            String imageUrl = executedPlayer != null ? 
                "/img/dead_by_vote.png" : 
                "/img/survive_from_vote.png";

            // 하나의 응답으로 통합
            FinalVoteResultResponse response = new FinalVoteResultResponse(
                room.getGameStatus().toString(),
                room.getPlayers(),
                room.getAgreeVotes(),
                room.getDisagreeVotes(),
                executedPlayer != null,
                resultMessage,
                imageUrl  // 이미지 URL도 포함
            );
            
            messagingTemplate.convertAndSend("/topic/game.finalvote.result." + roomKey, response);
            log.info("최종 투표 결과 전송 완료 - 방: {}, 현재 상태: {}", roomKey, room.getGameStatus());

        } catch (Exception e) {
            log.error("최종 투표 결과 처리 실패:", e);
        }
    }

    // 최종 투표 결과 응답 형식
    record FinalVoteResultResponse(
            String gameStatus,
            List<Player> players,
            int agreeVotes,
            int disagreeVotes,
            boolean isExecuted,
            String message,
            String imageUrl) {
    }

    // 타이머 관련 메시지 처리
    @MessageMapping("/game.timer.modify/{roomKey}")
    public void handleTimerModification(
            @DestinationVariable("roomKey") Integer roomKey,
            @Payload TimerModifyRequest request) {
        try {
            log.info("타이머 수정 요청 - 방: {}, 플레이어: {}, 조정시간: {}",
                    roomKey, request.playerNumber(), request.adjustment());

            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                throw new RuntimeException("방을 찾을 수 없습니다: " + roomKey);
            }

            // 플레이어 확인
            Player player = room.getPlayerByPlayerNumber(request.playerNumber());
            if (player == null || !player.isAlive()) {
                throw new RuntimeException("유효하지 않은 플레이어입니다.");
            }

            // 현재 시간 가져오기 및 수정
            int currentTime = room.getCurrentTime();
            int newTime = currentTime + request.adjustment();

            // 시간은 0 미만이 될 수 없음
            newTime = Math.max(0, newTime);
            room.setCurrentTime(newTime);

            // 수정된 시간 브로드캐스트
            TimerResponse response = new TimerResponse(
                    newTime,
                    room.getGameStatus().toString(),
                    true,
                    String.format("Player %d가 시간을 %d초 %s하였습니다.",
                            request.playerNumber(),
                            Math.abs(request.adjustment()),
                            request.adjustment() > 0 ? "증가" : "감소"));

            // 타이머 수정 후 시스템 메시지도 함께 전송
            messagingTemplate.convertAndSend("/topic/game.timer." + roomKey, response);
            
            // 시스템 메시지 전송
            SystemMessage systemMessage = new SystemMessage(
                "System",
                String.format("%s 님이 시간을 %d초 %s시켰습니다.",
                    player.getUsername(),
                    Math.abs(request.adjustment()),
                    request.adjustment() > 0 ? "증가" : "감소"),
                room.getGameStatus().toString(),
                roomKey,
                0,
                true
            );
            messagingTemplate.convertAndSend("/topic/game.system." + roomKey, systemMessage);

        } catch (Exception e) {
            log.error("타이머 수정 실패:", e);
            TimerResponse errorResponse = new TimerResponse(
                    null,
                    null,
                    false,
                    "타이머 수정 실패: " + e.getMessage());
            messagingTemplate.convertAndSend("/topic/game.timer." + roomKey, errorResponse);
        }
    }

    // 타이머 수정 요청 객체
    record TimerModifyRequest(
            Integer playerNumber, // 시간을 수정하려는 플레이어 번호
            Integer adjustment // 조정할 시간 (초 단위, +15 또는 -15)
    ) {
    }

    // 타이머 응답 객체
    record TimerResponse(
            Integer time, // 현재 시간 (초 단위)
            String gameStatus, // 현재 게임 상태
            boolean success, // 성공 여부
            String message // 메시지
    ) {
    }

    @MessageMapping("/game.players.join/{roomKey}")
    public void handlePlayerJoin(
            @DestinationVariable("roomKey") Integer roomKey,
            @Payload Player playerData) {
        log.info("플레이어 입장 - 방: {}, 플레이어: {}", roomKey, playerData);

        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                log.error("방을 찾을 수 없음: {}", roomKey);
                return;
            }

            // 방장인 경우 게임 타이머 시작
            if (playerData.getUsername().equals(room.getHostName())) {
                log.info("방장 입장 - 게임 초기화 시작");

                // 초기 상태 설정--> 하은님 제가 바꿨어요 여기에여
                room.setGameStatus(GameStatus.FOURTH_DELAY);
                room.setCurrentTime(room.getDefaultTimes().get(GameStatus.FOURTH_DELAY));
                room.setTurn(1); // 1일차로 설정

                // 상태 전송
                messagingTemplate.convertAndSend(
                        "/topic/game.state." + roomKey,
                        new GameStateResponse(
                                room.getGameStatus().toString(),
                                room.getPlayers(),
                                room.getCurrentTime(),
                                room.getTurn(),
                                true,
                                "게임이 시작되었습니다." + room.getGameStatus().toString() + "시간입니다.",
                                imageUrl));

                // 타이머 시작
                startRoomTimer(roomKey);
            }

            // 입장한 플레이어 정보 브로드캐스트
            messagingTemplate.convertAndSend(
                    "/topic/game.players." + roomKey,
                    room.getPlayers());

        } catch (Exception e) {
            log.error("플레이어 입장 처리 중 오류:", e);
        }
    }

    public record SystemMessage(
            String username,
            String content,
            String gameStatus,
            Integer roomKey,
            Integer playerNumber,
            boolean isSystemMessage) {
    }

    @MessageMapping("/game.system.{roomKey}")
    public void handleSystemMessage(
            @DestinationVariable("roomKey") Integer roomKey,
            @Payload SystemMessage systemMessage) {
        log.info("시스템 메시지 수신 - 방: {}, 메시지: {}", roomKey, systemMessage);
        messagingTemplate.convertAndSend(
                "/topic/game.system." + roomKey,
                systemMessage);
    }

    // 자바스크립트에서 쏘는 경찰 채팅 메시지가 있다면 얘 사용하면됨.
    @MessageMapping("/game.police.{roomKey}")
    public void handlePoliceMessage(
            @DestinationVariable("roomKey") Integer roomKey,
            @Payload SystemMessage systemMessage) {
        log.info("경찰 조사 결과 수신 - 방: {}, 메시지: {}", roomKey, systemMessage);
        messagingTemplate.convertAndSend(
                "/topic/game.police." + roomKey,
                systemMessage);
    }

}
