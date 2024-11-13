package com.kosafia.gameapp.models.gameroom;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Random;

import com.fasterxml.jackson.annotation.JsonProperty;

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


    private final Integer roomKey; // PK와 로비에 보이는 키 (String 형식)
    private String roomName; // 방제 //입력받음
    private List<Player> players; // 플레이어 목록
    private String hostName; // 방장 이름
    private int currentPlayers; // 현재 인원 
    private int maxPlayers; // 최대 인원 //입력받음
    @JsonProperty("isPlaying")
    private boolean isPlaying; // 게임 진행 여부
    private Integer turn; // 현재 턴
    private String password; // 방 비밀번호 //입력받음
    @JsonProperty("isPrivate") // JSON 필드 이름을 "isPrivate"으로 변경
    private boolean isPrivate; // 비밀 방 여부 //입력받음
    private GameStatus gameStatus; //게임 상태: 낮 밤 등등
    

    // private Integer nextPlayerNumber = 1; // 다음에 부여할 번호
     private Random random = new Random();

    

    public Room(Integer roomKey, String roomName, int maxPlayers, String password, boolean isPrivate) {
        this.roomKey = roomKey;
        this.roomName = roomName;
        this.players = new ArrayList<>();
        this.hostName = null;        
        this.maxPlayers = maxPlayers;
        this.isPlaying = false;
        this.turn = 0;
        this.password = password;
        this.isPrivate = isPrivate;
        this.gameStatus = GameStatus.NONE;
    }

    //플레이어 조회
    public Player getPlayerByUserEmail(String userEmail){
        for (Player player : players) {
            if(player.getUserEmail() == userEmail){
                return player;
            }
        }
        return null;
    }
    //------김남영 추가------
    public Player getPlayerByPlayerNumber(Integer playerNumber){
        for (Player player : players) {
            if(player.getPlayerNumber() == playerNumber){
                return player;
            }
        }
        return null;
    }




    // 플레이어 추가 메서드
    public boolean addPlayer(String username, String userEmail) {
        if (players.size() >= maxPlayers) {
            System.out.println("최대 인원이 다 찼습니다. 더 이상 플레이어를 추가할 수 없습니다.");
            return false; // 최대 인원 초과 시 추가 거부
        }
        

        int playerNumber = players.size() + 1; // 현재 리스트 크기 + 1로 playerNumber 부여
        Player player = new Player(playerNumber, username, userEmail);
        players.add(player);
        currentPlayers++; // 플레이어 추가 시 현재 인원수 증가

        // 방장이 없는 경우 첫 번째 플레이어를 방장으로 설정
        if (hostName == null) {
            hostName = player.getUsername();
            log.info("방장이 지정 되었습니다: "+hostName);
        }

        return true;
    }

    


    // 플레이어 제거 메서드
    public boolean removePlayer(Player player) {
        // int index = players.indexOf(player); // 나가는 플레이어의 인덱스 확인
        // if (index == -1) {
        //     System.out.println("플레이어를 찾을 수 없습니다.");
        //     return false;
        // }

       

        // 플레이어를 직접 제거
        boolean removed = players.remove(player);
        if (!removed) {
            System.out.println("플레이어를 찾을 수 없습니다.");
            return false;
        }

        // players.remove(index); // 해당 플레이어 제거
        currentPlayers--; // 플레이어 제거 시 현재 인원수 감소

       // 방장이 나가면 새 방장 지정
       if (player.getUsername().equals(hostName)) {
            assignNewHost(); 
        }

         // playerNumber 재정렬: 나간 플레이어의 위치 이후의 모든 플레이어의 playerNumber를 재정렬
        for (int i = 0; i < players.size(); i++) {
            players.get(i).setPlayerNumber(i + 1); // 새 번호를 1부터 다시 부여
        }

        // // 뒤에 있는 플레이어들의 번호를 앞으로 당김
        // for (int i = index; i < players.size(); i++) {
        //     players.get(i).setPlayerNumber(i + 1); // playerNumber를 i + 1로 업데이트
        // }
        return true;
    }

    //////////////////////////

  

    // 게임 시작 메서드
    public void startGame() {
        if (!isPlaying && players.size() >= 4) { // 최소 4인 이상일 때 시작 가능
            this.isPlaying = true;
            this.turn = 1; // 첫 턴 초기화
            this.gameStatus = GameStatus.NIGHT;
            // setGameStatus(gameStatus);
        }
    }

    // 게임 종료 메서드
    public void endGame() {
        this.isPlaying = false;
        this.turn = 0;
        this.gameStatus = GameStatus.NONE;

    }

    ///////////////////////////
    

      // 방장 확인 메서드
      public boolean isHost(String username) {
        return username != null && username.equals(hostName);
    }


     // 새 방장 지정 메서드 (랜덤 선택)
     private void assignNewHost() {
        if (!players.isEmpty()) {
            Player newHost = players.get(random.nextInt(players.size())); // 남아 있는 플레이어 중 랜덤 선택
            hostName = newHost.getUsername();
            System.out.println("새 방장으로 " + hostName + "가 지정되었습니다.");
        } else {
            hostName = null; // 방에 남아 있는 플레이어가 없으면 방장 없음
            System.out.println("방장없음!!!");

        }
    }



}
