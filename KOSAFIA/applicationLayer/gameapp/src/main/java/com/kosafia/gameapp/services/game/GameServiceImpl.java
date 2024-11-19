package com.kosafia.gameapp.services.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.kosafia.gameapp.models.gameroom.FinishGame;
import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;

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

                // 경찰 조사 결과 나타내는 채팅? 팝업?
            }

            // 2. 의사가 마피아의 타겟을 보호하는지 확인
            if (mafiaTarget != null && doctorTarget != null &&
                    mafiaTarget.equals(doctorTarget)) {
                System.out.println("의사가 마피아의 타겟을 보호했습니다!");

                messagingTemplate.convertAndSend(
                        "/topic/game.sound." + roomKey,
                        Map.of("sound", "heal"));

            } else if (mafiaTarget != null) {
                // 마피아의 타겟이 보호받지 못했다면 사망 처리
                roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(mafiaTarget).setAlive(false);
                System.out
                        .println(roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(mafiaTarget).getPlayerNumber()
                                + "은(는) 마피아에게 살해당했습니다.");
                // 클라이언트에게 비명 사운드 재생 요청
                messagingTemplate.convertAndSend(
                        "/topic/game.sound." + roomKey,
                        Map.of("sound", "gun"));

                // System.out.println("Alive 된지 확인 여부 : "
                // +
                // roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(mafiaTarget).isAlive());
                // 마피아 살해당한 이미지 나타내기

                // 클라이언트에게 비명 사운드 재생 요청
                messagingTemplate.convertAndSend(
                        "/topic/game.sound." + roomKey,
                        Map.of("sound", "gun"));

                // 승리조건 확인
                checkGameEnd(players, roomKey);
            }
        }
    }

    // 게임 승리 조건을 체크하는 함수
    private void checkGameEnd(List<Player> players, Integer roomKey) {
        long mafiaCount = players.stream().filter(player -> player.getRole() == Role.MAFIA && player.isAlive()).count();
        long otherCount = players.stream().filter(player -> player.getRole() != Role.MAFIA && player.isAlive()).count();

        // 1. 마피아의 인원수가 다른 직업들 이상일 경우 마피아 승리
        if (mafiaCount >= otherCount) {
            System.out.println("마피아 승리");
            // 승리 상태와 이미지 URL을 포함하여 브로드캐스트
            broadcastGameStatus(roomKey, players, "mafia_win_image_url");
            return;
        }

        // 2. 마피아가 모두 사망하면 마피아 승리
        if (mafiaCount == 0) {
            System.out.println("마피아 전멸!");
            // 시민 승리 상태와 이미지 URL을 포함하여 브로드캐스트
            broadcastGameStatus(roomKey, players, "citizen_win_image_url");
            return;
        }

        // 게임이 종료되지 않으면 게임 상태를 업데이트하여 계속 진행
        broadcastGameStatus(roomKey, players, null);
    }

    public void broadcastGameStatus(Integer roomKey, List<Player> players, String imageUrl) {
        Map<String, Object> message = new HashMap<>();
        message.put("players", players);
        if (imageUrl != null) {
            message.put("imageUrl", imageUrl); // 이미지 URL 포함
        }

        // messagingTemplate.convertAndSend("/topic/game.state." + roomKey, message);
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
}
