package com.kosafia.gameapp.services.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.kosafia.gameapp.models.gameroom.GameStatus;
import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;

@Service
public class GameServiceImpl implements GameService {

    private Integer mafiaTarget = null; // 마피아가 선택한 타겟
    private Integer doctorSaveTarget = null; // 의사가 선택한 타겟

    private static final Role[] ROLES = {
            Role.MAFIA, Role.DOCTOR, Role.POLICE,
            Role.CITIZEN, Role.CITIZEN, Role.CITIZEN,
            Role.CITIZEN, Role.CITIZEN
    };

    private Integer mafiaTargetNumber = null;
    private Integer doctorSaveTargetNumber = null;

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
    public boolean mafiaSelectTarget(List<Player> players, Integer targetNumber) {
        this.mafiaTarget = targetNumber;
        return true;
    }

    @Override
    public boolean doctorSavePlayer(List<Player> players, Integer targetNumber) {
        this.doctorSaveTarget = targetNumber;
        return true;
    }

    @Override
    public Role policeCheckRole(List<Player> players, Integer targetNumber) {
        Optional<Player> targetPlayer = players.stream()
                .filter(p -> p.getPlayerNumber().equals(targetNumber))
                .findFirst();
        return targetPlayer.map(Player::getRole).orElse(Role.NONE);
    }

    @Override
    public void nightActionResult(List<Player> players) {
        // 결과를 처리할 로직
        if (mafiaTarget != null) {
            Optional<Player> mafiaTargetPlayer = players.stream()
                    .filter(p -> p.getPlayerNumber().equals(mafiaTarget) && p.isAlive())
                    .findFirst();

            if (mafiaTargetPlayer.isPresent()) {
                // 의사가 마피아의 타겟을 살린 경우
                if (doctorSaveTarget != null && mafiaTarget.equals(doctorSaveTarget)) {
                    System.out.println("의사가 마피아의 타겟을 살렸습니다: " + mafiaTargetPlayer.get().getUsername());
                } else {
                    mafiaTargetPlayer.get().setAlive(false);
                    System.out.println("마피아에 의해 살해되었습니다: " + mafiaTargetPlayer.get().getUsername());
                }
            }
        }
        // 상태 초기화
        this.mafiaTarget = null;
        this.doctorSaveTarget = null;
    }

    //===============김남영 추가=============
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
    //=========================================
}
