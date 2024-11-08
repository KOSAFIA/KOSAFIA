package com.kosafia.gameapp.services.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.kosafia.gameapp.models.gameroom.Player;
import com.kosafia.gameapp.models.gameroom.Role;

@Service
public class GameServiceImpl implements GameService {
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

    // 마피아 밤 상호작용 - 타겟 설정
    public boolean mafiaSelectTarget(ArrayList<Player> players, Integer targetNumber) {

        // 플레이어 목록에서 targetNumber에 해당하는 플레이어 찾기
        Optional<Player> targetPlayer = players.stream()
                .filter(player -> player.getPlayerNumber().equals(targetNumber))
                .findFirst();

        if (targetPlayer.isPresent()) {
            this.mafiaTargetNumber = targetNumber;
            return true; // 타겟 설정 성공
        }
        return false;
    }

    // 의사 밤 상호작용 - 보호할 플레이어 설정
    public boolean doctorSavePlayer(ArrayList<Player> players, Integer saveTargetNumber) {
        Optional<Player> saveTargetPlayer = players.stream()
                .filter(player -> player.getPlayerNumber().equals(saveTargetNumber))
                .findFirst();

        if (saveTargetPlayer.isPresent()) {
            this.doctorSaveTargetNumber = saveTargetNumber;
            return true; // 보호 대상 설정 성공
        }
        return false; // 보호 대상 설정 실패 (존재하지 않는 플레이어 번호)
    }

    // 경찰 밤 상호작용 - 역할 조사
    public Role policeCheckRole(ArrayList<Player> players, Integer checkTargetNumber) {
        return players.stream()
                .filter(player -> player.getPlayerNumber().equals(checkTargetNumber))
                .map(Player::getRole)
                .findFirst()
                .orElse(Role.NONE);
    }

    // 밤 시간 결과 처리 - 마피아의 공격과 의사의 보호 상호작용
    public void nightActionResult(ArrayList<Player> players) {
        Optional<Player> mafiaTarget = players.stream()
                .filter(player -> player.getPlayerNumber().equals(mafiaTargetNumber))
                .findFirst();

        Optional<Player> doctorSaveTarget = players.stream()
                .filter(player -> player.getPlayerNumber().equals(doctorSaveTargetNumber))
                .findFirst();

        if (mafiaTarget.isPresent()) {
            Player target = mafiaTarget.get();
            // 의사가 보호하면 살리고, 그렇지 않으면 죽임
            if (doctorSaveTarget.isPresent() && doctorSaveTarget.get().equals(target)) {
                target.setAlive(true); // 살려줌
            } else {
                target.setAlive(false); // 죽임
            }
        }

        // 밤 행동 완료 후 타겟 초기화
        this.mafiaTargetNumber = null;
        this.doctorSaveTargetNumber = null;
    }
}
