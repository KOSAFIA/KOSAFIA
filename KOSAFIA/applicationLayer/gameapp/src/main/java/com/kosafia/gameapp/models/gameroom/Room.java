package com.kosafia.gameapp.models.gameroom;

import java.util.ArrayList;
import java.util.List;

import com.kosafia.gameapp.models.user.UserData;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Builder @AllArgsConstructor
@Data
@ToString
public class Room {
    private final Integer roomId;
    private final List<UserData> users;
    private final int maxUsers;
    private UserData host;


    //방 최초 생성
    public Room(Integer roomId,int maxUsers ) {
        this.roomId = roomId;
        this.users = new ArrayList<>();
        this.maxUsers = maxUsers;
        this.host = null;
      
    }


    // 단일 UserData 추가
    public boolean addUser(UserData userData) {
        // users.add(userData);

        if (users.size() < maxUsers) {
            
            this.users.add(userData);
            // playerStatuses.put(player.getId(), "alive"); // 기본 상태 설정
            if (users.size() == 1) {
                log.info("너가 최초야");
                this.host = userData; // 첫 입장 플레이어를 호스트로 설정
            }
            return true;
        }
        return false;

    }

     // 플레이어list 추가 메서드
     public void addAllUsers(List<UserData> users) {
        users.addAll(users);
    }

    // one 플레이어 제거
     public void removePlayer(UserData userData) {
        users.remove(userData);
    }

     // 현재 사용자 리스트 반환
     public List<UserData> getUsers() {
        return users;
    }

    // 현재 플레이어 수 반환
    public int getPlayerCount() {
        return users.size();
    }
}
