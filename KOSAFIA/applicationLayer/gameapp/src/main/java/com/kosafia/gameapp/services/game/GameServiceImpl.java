package com.kosafia.gameapp.services.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;
import com.kosafia.gameapp.repositories.gameroom.RoomRepository;

@Service
public class GameServiceImpl implements GameService {

    @Autowired
    RoomRepository roomRepository;

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
            }

            // 2. 의사가 마피아의 타겟을 보호하는지 확인
            if (mafiaTarget != null && doctorTarget != null &&
                    mafiaTarget.equals(doctorTarget)) {
                System.out.println("의사가 마피아의 타겟을 보호했습니다!");
            } else if (mafiaTarget != null) {
                // 마피아의 타겟이 보호받지 못했다면 사망 처리
                roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(mafiaTarget).setAlive(false);
                System.out
                        .println(roomRepository.getRoom(roomKey).getPlayerByPlayerNumber(mafiaTarget).getPlayerNumber()
                                + "은(는) 마피아에게 살해당했습니다.");
            }
        }
    }

    // ===============김남영 추가=============
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

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
