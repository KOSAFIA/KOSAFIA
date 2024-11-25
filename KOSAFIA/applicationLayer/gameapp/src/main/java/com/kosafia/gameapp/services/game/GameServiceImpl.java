package com.kosafia.gameapp.services.game;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.kosafia.gameapp.controllers.socket.game.GameSocketController.SystemMessage;
import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GameServiceImpl implements GameService {

    @Autowired
    RoomRepository roomRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public void handleNightActions(List<Player> players, Integer roomKey) {
        Integer doctorTarget = null;
        Integer mafiaTarget = null;
        String totalMessage = null;
        String policeMessage = null;
        String resultCase = "none";
        String stageImageUrl = null;
        String endingImageUrl = null;

        for (Player player : players) {
            // 1. 마피아, 경찰, 의사의 행동을 정리
            if (player.getRole() == Role.MAFIA && player.getTarget() != null) {
                mafiaTarget = player.getTarget();
            }

            if (player.getRole() == Role.DOCTOR && player.getTarget() != null) {
                doctorTarget = player.getTarget();
            }

            if (player.getRole() == Role.POLICE && player.getTarget() != null) {
                Integer investigatedPlayer = player.getTarget();
                // 경찰은 마피아 여부를 조사하여 메시지로 알려줌
                boolean isMafia = (roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(investigatedPlayer)
                        .getRole() == Role.MAFIA);
                System.out.println(
                        "경찰 조사 결과: "
                                + roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(investigatedPlayer)
                                        .getPlayerNumber()
                                + "은 "
                                + (isMafia ? "마피아입니다." : "마피아가 아닙니다."));

                // // 마피아 발견 이미지 전달
                // imageUrl = "/img/find_mafia.png";
                // broadcastGameStatus(roomKey, imageUrl);

                // 김남영 경찰 조사 결과 나타내는 채팅 일단 추가
                policeMessage = "경찰 조사 결과: "
                        + roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(investigatedPlayer)
                                .getUsername()
                        + "은 "
                        + (isMafia ? "마피아입니다." : "마피아가 아닙니다.");
            }

            // 2. 의사가 마피아의 타겟을 보호하는지 확인
            if (mafiaTarget != null && doctorTarget != null &&
                    mafiaTarget.equals(doctorTarget)) {
                System.out.println("의사가 마피아의 타겟을 보호했습니다!");
                roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(mafiaTarget).setAlive(true);

                // 여기에 사운드 결과 추가
                resultCase = "heal";

                // 김남영 전체 시스템 메시지 추가
                totalMessage = "의사가 마피아로부터 보호했습니다!";

            } else if (mafiaTarget != null) {
                // 마피아의 타겟이 보호받지 못했다면 사망 처리
                roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(mafiaTarget).setAlive(false);
                System.out
                        .println(roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(mafiaTarget).getPlayerNumber()
                                + "은(는) 마피아에게 살해당했습니다.");

                // 김남영 시스템 메시지 추가
                totalMessage = roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(mafiaTarget).getUsername()
                        + "은(는) 마피아에게 살해당했습니다.";

                // 여기에 사운드 결과 추가
                resultCase = "dead";
            }

            player.setTarget(null);
        }

        //승리조건 이미지 따오는 조건 뜨면 바로 그냥 엔드 처리리
        endingImageUrl = checkGameEnd(players, roomKey);
        if (endingImageUrl != null) {
            endingBroadcastGameStatus(roomKey, endingImageUrl);
            return;
        }

        // 여기에 소켓 추가해야. players 반복문 횟수만큼 쏘는 현상을 방지함.

        String interactionImageUrl = null;

        switch (resultCase) {
            case "heal":
                messagingTemplate.convertAndSend(
                        "/topic/game.sound." + roomKey,
                        Map.of("sound", "heal"));

                interactionImageUrl = "/img/survive_from_doctor.png";
                interactionBroadcastGameStatus(roomKey, interactionImageUrl);
                break;
            case "dead":
                messagingTemplate.convertAndSend(
                        "/topic/game.sound." + roomKey,
                        Map.of("sound", "gun"));

                interactionImageUrl = "/img/dead_by_mafia.png";
                interactionBroadcastGameStatus(roomKey, interactionImageUrl);

                break;
            default:
                break;
        }

        // 김남영 전체 시스템 메시지 추가
        messagingTemplate.convertAndSend("/topic/game.system." + roomKey, new SystemMessage(
                "SYSTEM",
                totalMessage,
                roomRepository.getRoom(roomKey).getGameStatus().toString(),
                roomKey,
                0,
                true));
        
        messagingTemplate.convertAndSend("/topic/game.police." + roomKey, new SystemMessage(
                "POLICE",
                policeMessage,
                roomRepository.getRoom(roomKey).getGameStatus().toString(),
                roomKey,
                0,
                false));

    }

    // 게임 승리 조건을 체크하는 함수
    // -> [김남영]조건 체크니까 이미지경로 널값으로 처리하고 밤이벤트 끝나면 하나만 보여주면 되지 않나나
    @Override
    public String checkGameEnd(List<Player> players, Integer roomKey) {

        String endingImageUrl = null;

        long mafiaCount = players.stream()
                .filter(player -> player.getRole() == Role.MAFIA && player.isAlive())
                .count();
        long otherCount = players.stream()
                .filter(player -> player.getRole() != Role.MAFIA && player.isAlive())
                .count();

        log.info("마피아 수: {}, 시민 수: {}", mafiaCount, otherCount);

        // 마피아 승리 조건
        if (mafiaCount >= otherCount) {
            endingImageUrl = "/img/mafia_win.png";
            return endingImageUrl;
        }
        // 시민 승리 조건
        else if (mafiaCount == 0) {
            endingImageUrl = "/img/citizen_win.png";
            return endingImageUrl;
        }
        // // 브로드캐스트
        // endingBroadcastGameStatus(roomKey, endingImageUrl);
        return null;
    }

    // ===============김남영 추가=============

    @Override
    // 게임 상태 변경을 브로드캐스트
    public void broadcastGameStatus(Integer roomKey, GameStatus gameStatus, List<Player> players) {
        Map<String, Object> message = new HashMap<>();
        message.put("gameStatus", gameStatus);
        message.put("players", players);

        messagingTemplate.convertAndSend("/topic/game.state." + roomKey, message);
    }

    // 플레이어 정보 변경을 브로드캐스트
    public void broadcastPlayerUpdate(Integer roomKey, List<Player> players) {
        messagingTemplate.convertAndSend("/topic/game.players." + roomKey, players);
    }
    // =========================================

    @Override
    public void interactionBroadcastGameStatus(Integer roomKey, String interactionImageUrl) {
        Map<String, Object> message = new HashMap<>();

        if (interactionImageUrl != null) {
            message.put("interactionImageUrl", interactionImageUrl);
        }

        // WebSocket 메시지 브로드캐스트
        messagingTemplate.convertAndSend("/topic/game.state." + roomKey, message);
    }

    @Override
    public void stageBroadcastGameStatus(Integer roomKey, String stageImageUrl) {
        Map<String, Object> message = new HashMap<>();

        if (stageImageUrl != null) {
            message.put("stageImageUrl", stageImageUrl);
        }

        // WebSocket 메시지 브로드캐스트
        messagingTemplate.convertAndSend("/topic/game.state." + roomKey, message);
    }

    @Override
    public void endingBroadcastGameStatus(Integer roomKey, String endingImageUrl) {
        Map<String, Object> message = new HashMap<>();

        if (endingImageUrl != null) {
            message.put("endingImageUrl", endingImageUrl);
        }

        // WebSocket 메시지 브로드캐스트
        messagingTemplate.convertAndSend("/topic/game.state." + roomKey, message);
    }
}
