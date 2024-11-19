package com.kosafia.gameapp.models.gameroom;

import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import com.kosafia.gameapp.controllers.socket.game.GameSocketController;
import com.kosafia.gameapp.controllers.socket.game.TimerResponse;

import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Timer {
    private Room room = null;
    private GameSocketController socketController = null;
    private ScheduledExecutorService executor;
    private ScheduledFuture<?> future;
    // private GameStatus nextScheduledStatus;  // 딜레이 이후 전환될 상태
    //아 시발 복잡해해
    
    // private static final Map<GameStatus, Integer> DEFAULT_TIMES = Map.of(
    //     GameStatus.NIGHT, 30,
    //     GameStatus.DELAY, 5,
    //     GameStatus.DAY, 60,
    //     GameStatus.VOTE, 30,
    //     GameStatus.FINALVOTE, 15,
    //     GameStatus.NONE, 0
    // );
    
    // private static final Map<GameStatus, GameStatus> NEXT_STATUS = Map.of(
    //     GameStatus.NIGHT, GameStatus.DAY,
    //     GameStatus.DAY, GameStatus.VOTE,
    //     GameStatus.VOTE, GameStatus.FINALVOTE,
    //     GameStatus.FINALVOTE, GameStatus.NIGHT
    // );

    public Timer(Room room, GameSocketController socketController) {
        this.room = room;
        this.socketController = socketController;
        this.executor = Executors.newSingleThreadScheduledExecutor();
    }

    // public void scheduleNextState(GameStatus currentStatus) {
    //     GameStatus nextStatus = switch (currentStatus) {
    //         case NIGHT -> {
    //             nextScheduledStatus = GameStatus.DAY;
    //             yield GameStatus.DELAY;
    //         }
    //         case DAY -> {
    //             nextScheduledStatus = GameStatus.VOTE;
    //             yield GameStatus.DELAY;
    //         }
    //         case VOTE -> {
    //             nextScheduledStatus = GameStatus.FINALVOTE;
    //             yield GameStatus.DELAY;
    //         }
    //         case FINALVOTE -> {
    //             nextScheduledStatus = GameStatus.NIGHT;
    //             yield GameStatus.DELAY;
    //         }
    //         case DELAY -> nextScheduledStatus;  // 이미 설정된 다음 상태로 전환
    //         default -> null;
    //     };

    //     if (nextStatus != null) {
    //         room.setGameStatus(nextStatus);
    //         room.setCurrentTime(getDefaultTime(nextStatus));
    //         socketController.broadcastGameState(room);
    //         start();
    //     }
    // }

    public void start() {
        if (future != null) {
            future.cancel(true);
        }

        future = executor.scheduleAtFixedRate(() -> {
            try {
                if (room.getCurrentTime() > 0) {
                    room.setCurrentTime(room.getCurrentTime() - 1);
                    socketController.broadcastTimerUpdate(room);
                } else {
                    stop();
                    // socketController.broadcastTimerEnd(room); 아니 소켓이 타이머 끝난걸 알려줄 필요가 있어?? 없지 않나?
                }
            } catch (Exception e) {
                log.error("Timer error", e);
            }
        }, 0, 1, TimeUnit.SECONDS);
    }

    public void stop() {
        if (future != null) {
            future.cancel(true);
        }
        // executor.shutdown();
    }

    public void shutdown(){
        stop();
        executor.shutdown();
    }

    // private void handleTimerEnd() {
    //     if (room.getGameStatus() == GameStatus.DELAY) {
    //         // DELAY 상태가 끝나면 미리 저장해둔 다음 상태로 전환
    //         room.setGameStatus(nextScheduledStatus);
    //         room.setCurrentTime(getDefaultTime(nextScheduledStatus));
    //         socketController.broadcastGameState(room);
    //         start();
    //     } else {
    //         // 일반 상태가 끝나면 DELAY로 전환
    //         scheduleNextState(room.getGameStatus());
    //     }
    // }

    // public static int getDefaultTime(GameStatus status) {
    //     return DEFAULT_TIMES.getOrDefault(status, 0);
    // }
}
