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

import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@Slf4j
@Controller
public class GameSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RoomRepository roomRepository;

    // 채팅 메시지 처리 - @Payload 어노테이션 추가 및 디버그 로그 추가
    @MessageMapping("/game.chat.send/{roomKey}")
    public void handleGameChat(
        @DestinationVariable("roomKey") Integer roomKey, 
        @Payload ChatMessage message
    ) {
        log.info("게임 채팅 메시지 수신 - 방: {}, 메시지: {}", roomKey, message);
        try {
            // 메시지 유효성 검사
            if (message == null || message.username() == null || message.content() == null) {
                log.error("잘못된 채팅 메시지 형식: {}", message);
                return;
            }

            // 밤에는 마피아 채팅만 허용하고, 마피아끼리만 볼 수 있게 처리
            if ("NIGHT".equals(message.gameStatus())) {
                if ("MAFIA".equals(message.role())) {
                    log.info("마피아 채팅 전송 - 방: {}", roomKey);
                    messagingTemplate.convertAndSend(
                        "/topic/game.chat.mafia." + roomKey, 
                        message
                    );
                }
            } else {
                log.info("일반 채팅 전송 - 방: {}", roomKey);
                messagingTemplate.convertAndSend(
                    "/topic/game.chat." + roomKey, 
                    message
                );
            }

            log.info("채팅 메시지 전송 완료 - 방: {}, 사용자: {}", roomKey, message.username());
        } catch (Exception e) {
            log.error("채팅 메시지 처리 중 오류 발생:", e);
        }
    }

    // 마피아가 타겟 선택했을 때
    @MessageMapping("/game.mafia.target/{roomKey}")
    public void handleMafiaTarget(
        @DestinationVariable("roomKey") Integer roomKey, 
        @Payload MafiaTargetMessage targetMessage
    ) {
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
                targetMessage
            );
            
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
            stateMessage
        );
    }

    // 채팅 메시지 형식 게임 중에 받아야할 채팅 객체, 
// 일반 룸채팅과 다른건 역할과 현재 게임 상태값이 포함되어야함.
record ChatMessage(
    String username,
    String content,
    String gameStatus,
    String role,
    Integer roomKey
){}

// 마피아 타겟 메시지 형식 마피아가 암살 시도 할때 어떤 형태로 메시지를 보내는지
record MafiaTargetMessage(
    Integer mafiaId,
    Integer targetId,
    Integer roomKey
){}

// 게임 상태 메시지 형식 게임 상태 변경 알림 메시지 형식 ((일단 안쓸 예정이지 않을까?)) 
record GameStateMessage(
    String gameStatus,
    List<Player> players
){}

    @MessageMapping("/game.state.update/{roomKey}")
    public void handleGameStateUpdate(
        @DestinationVariable("roomKey") Integer roomKey,
        @Payload GameStateUpdateRequest request
    ) {
        try {
            log.info("게임 상태 업데이트 요청 - 방: {}, 상태: {}", roomKey, request.gameStatus());
            
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) {
                throw new RuntimeException("방을 찾을 수 없습니다: " + roomKey);
            }

            // 상태 업데이트
            room.setGameStatus(GameStatus.valueOf(request.gameStatus()));
            
            // 브로드캐스트
            GameStateResponse response = new GameStateResponse(
                request.gameStatus(),
                room.getPlayers(),
                true,
                "게임 상태가 업데이트되었습니다."
            );

            messagingTemplate.convertAndSend("/topic/game.state." + roomKey, response);
        } catch (Exception e) {
            log.error("게임 상태 업데이트 실패:", e);
            GameStateResponse errorResponse = new GameStateResponse(
                null, null, false, 
                "게임 상태 업데이트 실패: " + e.getMessage()
            );
            messagingTemplate.convertAndSend("/topic/game.state." + roomKey, errorResponse);
        }
    }

    // 게임 상태 업데이트 요청 객체
    record GameStateUpdateRequest(String gameStatus) {}

    // 플레이어 상태 업데이트 브로드캐스트
    @MessageMapping("/game.players.update/{roomKey}")
    public void broadcastPlayerUpdate(
        @DestinationVariable("roomKey") Integer roomKey,
        @Payload PlayerUpdateRequest request
    ) {
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
            if (request.isAlive() != null) player.setAlive(request.isAlive());
            if (request.role() != null) player.setRole(Role.valueOf(request.role()));
            
            // 응답 생성 및 전송
            PlayerUpdateResponse response = new PlayerUpdateResponse(
                room.getGameStatus().toString(),
                room.getPlayers(),
                true,
                "플레이어 상태가 업데이트되었습니다."
            );

            log.info("플레이어 상태 브로드캐스트 전송 - 방: {}, 응답: {}", roomKey, response);
            messagingTemplate.convertAndSend("/topic/game.players." + roomKey, response);
            
        } catch (Exception e) {
            log.error("플레이어 상태 업데이트 실패 - 방: " + roomKey, e);
            PlayerUpdateResponse errorResponse = new PlayerUpdateResponse(
                null, null, false, 
                "플레이어 상태 업데이트 실패: " + e.getMessage()
            );
            messagingTemplate.convertAndSend("/topic/game.players." + roomKey, errorResponse);
        }
    }

    // 플레이어 상태 업데이트 요청 객체
    record PlayerUpdateRequest(
        Integer playerNumber,
        Boolean isAlive,
        String role
    ) {}

    // 플레이어 업데이트 응답 형식
    record PlayerUpdateResponse(
        String gameStatus,
        List<Player> players,
        boolean success,
        String message
    ) {}

    // 응답 형식 추가
    record GameStateResponse(
        String gameStatus,
        List<Player> players,
        boolean success,
        String message
    ) {}

    @MessageMapping("/game.vote/{roomKey}")
    public void handleVote(
        @DestinationVariable("roomKey") Integer roomKey,
        @Payload VoteMessage voteMessage
    ) {
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
                response
            );

            log.info("투표 현황 전송 완료 - 방: {}, 현황: {}", roomKey, room.getVoteStatus());
        } catch (Exception e) {
            log.error("투표 처리 중 오류 발생:", e);
        }
    }

    // 투표 메시지 형식
    record VoteMessage(
        Integer voterId,   // 투표한 사람
        Integer targetId,  // 투표 대상
        Integer roomKey    // 방 번호
    ) {}

    // 투표 현황 응답 형식
    record VoteStatusResponse(
        Map<Integer, Integer> voteStatus  // { targetId: 투표수 }
    ) {}

    @MessageMapping("/game.vote.result/{roomKey}")
    public void handleVoteResult(
        @DestinationVariable("roomKey") Integer roomKey,
        @Payload VoteResultRequest request
    ) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) return;

            // 최다 득표자 찾기
            Player mostVotedPlayer = room.getMostVotedPlayer();
            if (mostVotedPlayer != null) {
                mostVotedPlayer.setVoteTarget(true);
            }
            // 투표 결과 브로드캐스트
            VoteResultResponse response = new VoteResultResponse(
                mostVotedPlayer,
                room.getVoteStatus(),
                true,
                "투표 결과가 처리되었습니다."
            );

            messagingTemplate.convertAndSend(
                "/topic/game.vote.result." + roomKey,
                response
            );

            room.clearVotes();

        } catch (Exception e) {
            log.error("투표 결과 처리 실패:", e);
        }
    }

    record VoteResultRequest(
        Map<Integer, Integer> voteStatus
    ) {}

    record VoteResultResponse(
        Player targetPlayer,
        Map<Integer, Integer> finalVoteStatus,
        boolean success,
        String message
    ) {}


    // 최종 투표 결과 처리
    @MessageMapping("/game.finalvote.result/{roomKey}")
    public void handleFinalVoteResult(
        @DestinationVariable("roomKey") Integer roomKey
    ) {
        try {
            Room room = roomRepository.getRoom(roomKey);
            if (room == null) return;

            Player executedPlayer = room.processFinalVoteResult();  // 결과 처리를 Room으로 이동
            
            FinalVoteResultResponse response = new FinalVoteResultResponse(
                room.getGameStatus().toString(),
                room.getPlayers(),
                room.getAgreeVotes(),
                room.getDisagreeVotes(),
                executedPlayer != null,
                executedPlayer != null ? 
                    executedPlayer.getUsername() + "님이 처형되었습니다." : 
                    "투표 결과 처형되지 않았습니다."
            );

            messagingTemplate.convertAndSend(
                "/topic/game.finalvote.result." + roomKey,
                response
            );

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
        String message
    ) {}

}
