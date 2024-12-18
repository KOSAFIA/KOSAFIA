package com.kosafia.gameapp.models.gameroom;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Random;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.stream.Collectors;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Builder
@AllArgsConstructor
@Data
@ToString
public class Room {

    private final Integer roomKey; // PK와 로비에 보이는 키 인티저 형식이야 바보야 멍청아 똥아 아 이거 쥐피티 멍청이
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
    private GameStatus gameStatus; // 게임 상태: 낮 밤 등등

    // 김남영이 추가함 버그나면 김남영 불러

    // 투표 현황 (targetId -> 득표수)
    private Map<Integer, Integer> voteStatus;
    // 투표자별 투표 대상 기록 (voterId -> targetId)
    private Map<Integer, Integer> voterRecords;
    // 찬반 투표 현황 (playerNumber -> isAgree)
    private Map<Integer, Boolean> finalVoteStatus;

    // private Integer nextPlayerNumber = 1; // 다음에 부여할 번호
    private Random random = new Random();

    private int currentTime; // 현재 타이머 시간 (초 단위)
    private final Map<GameStatus, Integer> defaultTimes = Map.of(
            GameStatus.NIGHT, 30, // 밤 30초
            GameStatus.FIRST_DELAY, 5, // 딜레이 5초
            GameStatus.DAY, 60, // 낮 60초
            GameStatus.SECOND_DELAY, 5, // 딜레이 1초
            GameStatus.VOTE, 30, // 투표 30초
            GameStatus.THIRD_DELAY, 5, // 딜레이 5초
            GameStatus.FINALVOTE, 15, // 최후 변론 15초
            GameStatus.FOURTH_DELAY, 5 // 딜레이 5초
    );


    // 게임 상태 변경 시 타이머 자동 초기화를 위해 setGameStatus 수정
    public void setGameStatus(GameStatus newStatus) {
        if (this.gameStatus != newStatus) {
            this.gameStatus = newStatus;
            // 상태 변경 시 해당 상태의 기본 시간으로 초기화
            this.currentTime = getDefaultTimes().get(newStatus);
            if (newStatus == GameStatus.NIGHT){
                this.turn++;
            }
        }
    }

    // 시간 수정 메서드 (유효성 검사 포함)
    public boolean modifyTime(int playerNumber, int adjustment) {
        // 1. 플레이어 유효성 검사
        Player player = getPlayerByPlayerNumber(playerNumber);
        if (player == null || !player.isAlive()) {
            return false;
        }

        // 2. 게임 상태 검사 (DAY 상태에서만 가능)
        if (gameStatus != GameStatus.DAY) {
            return false;
        }

        // 3. 시간 조절
        int newTime = currentTime + adjustment;
        setCurrentTime(newTime);
        return true;
    }

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
        this.gameStatus = GameStatus.FOURTH_DELAY;

        // 김남영이 추가함 버그나면 김남영 불러
        this.voteStatus = new HashMap<>();
        this.voterRecords = new HashMap<>();
        this.finalVoteStatus = new HashMap<>();
        this.currentTime = 30;
    }

    // 투표 매서드: 이전에 이미 등록된 투표자의 타겟은 1만큼 감소시키고 다시 현재 투표 반영
    // 그러면 최종적으로는 아무도 투표안하면 비어있고
    // 투표를 막 바꾸면 총 8개의 키값이 생성되고 그 안에 밸류는 무작위인데 결국 총합은 8이 될것
    public void vote(Integer voterId, Integer targetId) {
        // 이전 투표가 있다면 해당 타겟의 득표수 감소
        Integer previousTarget = voterRecords.get(voterId);
        if (previousTarget != null) {
            voteStatus.merge(previousTarget, -1, Integer::sum);
        }

        // 새로운 투표 기록
        voterRecords.put(voterId, targetId);
        voteStatus.merge(targetId, 1, Integer::sum);
    }

    // 최다 득표자 반환 그냥 플레이어로 반환하는걸로 고침 멍청한 gpt 동률이면 null 반환
    public Player getMostVotedPlayer() {
        if (voteStatus.isEmpty()) {
            log.info("투표 기록이 없습니다.");
            return null;
        }

        // voteStatus에서 직접 최다 득표자 찾기
        Map.Entry<Integer, Integer> maxEntry = voteStatus.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .orElse(null);

        if (maxEntry == null || maxEntry.getValue() == 0) {
            log.info("유효한 투표가 없습니다.");
            return null;
        }

        // 동률 체크
        int maxVotes = maxEntry.getValue();
        long tieCount = voteStatus.values().stream()
            .filter(votes -> votes == maxVotes)
            .count();

        if (tieCount > 1) {
            log.info("동률이 발생했습니다. 최다 득표수: {}", maxVotes);
            return null;
        }

        Player targetPlayer = getPlayerByPlayerNumber(maxEntry.getKey());
        log.info("최다 득표자 선정: Player {}, 득표수: {}", maxEntry.getKey(), maxVotes);
        
        return targetPlayer;
    }

    // 특정 플레이어의 득표수 확인
    public int getVoteCount(Integer playerId) {
        return (int) voteStatus.values().stream()
                .filter(targetId -> targetId.equals(playerId))
                .count();
    }

    // 투표 초기화
    public void clearVotes() {
        voteStatus.clear();
        voterRecords.clear();
    }

    // 가져오기 매서드들
    public Player getPlayerByUserEmail(String userEmail) {
        for (Player player : players) {
            if (player.getUserEmail() == userEmail) {
                return player;
            }
        }
        return null;
    }

    public Player getPlayerByPlayerNumber(Integer playerNumber) {
        for (Player player : players) {
            if (player.getPlayerNumber() == playerNumber) {
                return player;
            }
        }
        return null;
    }

    public int getAgreeVotes() {
        return (int) finalVoteStatus.values().stream()
                .filter(vote -> vote)
                .count();
    }

    public int getDisagreeVotes() {
        return (int) finalVoteStatus.values().stream()
                .filter(vote -> !vote)
                .count();
    }

    public void processFinalVote(Integer playerNumber, boolean isAgree) {
        Player voter = getPlayerByPlayerNumber(playerNumber);
        if (voter == null || !voter.isAlive()) {
            throw new IllegalArgumentException("유효하지 않은 투표자");
        }
        finalVoteStatus.put(playerNumber, isAgree);
    }

    // 최종 투표 초기화
    public void clearFinalVotes() {
        finalVoteStatus.clear();
    }

    //여기서 서버 플레이어 죽네
    public Player processFinalVoteResult() {
        Player targetPlayer = players.stream()
                .filter(Player::isVoteTarget)
                .findFirst()
                .orElse(null);

        if (targetPlayer != null && getAgreeVotes() > getDisagreeVotes()) {
            targetPlayer.setAlive(false);
            targetPlayer.setVoteTarget(false);
            return targetPlayer;
        }

        if (targetPlayer != null) {
            targetPlayer.setVoteTarget(false);
        }
        return null;
    }

    // -----------김남영 추가 끝------------

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
            log.info("방장이 지정 되었습니다: " + hostName);
        }

        return true;
    }

    // 플레이어 제거 메서드
    public boolean removePlayer(Player player) {

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

        return true;
    }

    //////////////////////////

    // 게임 시작 메서드
    public boolean startGame() {
        System.out.println("게임 시작");
        if (!isPlaying) {
            this.isPlaying = true;
            this.turn = 1; // 첫 턴 초기화
            this.gameStatus = GameStatus.FOURTH_DELAY;
            // setGameStatus(gameStatus);
            System.out.println("게임 시작 완료 ");
            System.out.println(this.toString());

            this.currentTime = 30; // 게임은 밤부터 시작

            players.forEach(player -> {
                player.setAlive(true);
                System.out.println(player.getUsername() + "의 직업은 " + player.getRole() + "입니다.");
            });
            return true;
        }
        return false;
    }

    // 게임 종료 메서드
    public void endGame() {
        this.isPlaying = false;
        this.turn = 0;
        this.gameStatus = GameStatus.FOURTH_DELAY;

        // 플레이어 상태 초기화
        for (Player player : players) {
            player.setAlive(true); // 모든 플레이어를 살아 있는 상태로 초기화
            player.setRole(null); // 직업 초기화
            player.setVoteTarget(false); // 투표 타겟 여부 초기화

            player.setResult(Result.NONE);
            player.setTarget(null);

        }
        
        // 투표 관련 정보 초기화
        clearVotes();
        clearFinalVotes();

        log.info("방 상태가 초기화되었습니다: roomKey {}", this.roomKey);

        this.currentTime = 0;
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
