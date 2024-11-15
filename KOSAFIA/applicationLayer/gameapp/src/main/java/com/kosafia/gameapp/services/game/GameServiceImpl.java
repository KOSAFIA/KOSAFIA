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

@Service
public class GameServiceImpl implements GameService {

    // 8명을 기준으로, 역할을 하드코딩으로 나누어지도록 설정한 상태. 수정 필요
    private static final Role[] ROLES = {
            Role.MAFIA, Role.DOCTOR, Role.POLICE,
            Role.CITIZEN, Role.CITIZEN, Role.CITIZEN,
            Role.CITIZEN, Role.CITIZEN
    };

    @Override
    public void assignRoles(ArrayList<Player> players) {
        if (players == null || players.isEmpty()) {
            throw new IllegalArgumentException("Players list cannot be null or empty.");
        }
        ArrayList<Role> roles = new ArrayList<>(List.of(ROLES));
        Collections.shuffle(roles);

        for (int i = 0; i < players.size(); i++) {
            players.get(i).setRole(roles.get(i));
        }
    }

    @Override
    public void handleNightActions(ArrayList<Player> players) {
        Player doctorTarget = null;
        Player mafiaTarget = null;

        // 1. 마피아, 경찰, 의사의 행동을 정리
        for (Player player : players) {
            if (player.getRole() == Role.MAFIA && player.getTarget() != null) {
                mafiaTarget = players.get(player.getTarget() - 1);
            }

            if (player.getRole() == Role.DOCTOR && player.getTarget() != null) {
                doctorTarget = players.get(player.getTarget() - 1);
            }

            if (player.getRole() == Role.POLICE && player.getTarget() != null) {
                Player investigatedPlayer = players.get(player.getTarget() - 1);
                // 경찰은 마피아 여부를 조사하여 메시지로 알려줌
                boolean isMafia = investigatedPlayer.getRole() == Role.MAFIA;
                System.out.println(
                        "경찰 조사 결과: " + investigatedPlayer.getPlayerNumber() + "은 "
                                + (isMafia ? "마피아입니다." : "마피아가 아닙니다."));
            }
        }

        // 2. 의사가 마피아의 타겟을 보호하는지 확인
        if (mafiaTarget != null && doctorTarget != null && mafiaTarget.equals(doctorTarget)) {
            System.out.println("의사가 마피아의 타겟을 보호했습니다!");
        } else if (mafiaTarget != null) {
            // 마피아의 타겟이 보호받지 못했다면 사망 처리
            mafiaTarget.setAlive(false);
            System.out.println(mafiaTarget.getPlayerNumber() + "은(는) 마피아에게 살해당했습니다.");
        }

        // 플레이어의 상태가 제대로 변경되었는지 확인 (디버깅용)
        for (Player player : players) {
            System.out.println("업데이트된 플레이어 상태: " + player.getPlayerNumber() + " - alive 여부 : " + player.isAlive());
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
