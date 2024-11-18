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
    
    private static final Map<GameStatus, Integer> DEFAULT_TIMES = Map.of(
        GameStatus.NIGHT, 30,
        GameStatus.DELAY, 5,
        GameStatus.DAY, 60,
        GameStatus.VOTE, 30,
        GameStatus.FINALVOTE, 15,
        GameStatus.NONE, 0
    );
    
    private static final Map<GameStatus, GameStatus> NEXT_STATUS = Map.of(
        GameStatus.NIGHT, GameStatus.DAY,
        GameStatus.DAY, GameStatus.VOTE,
        GameStatus.VOTE, GameStatus.FINALVOTE,
        GameStatus.FINALVOTE, GameStatus.NIGHT
    );

    public Timer(Room room, GameSocketController socketController) {
        this.room = room;
        this.socketController = socketController;
        this.executor = Executors.newSingleThreadScheduledExecutor();
    }

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
                    handleTimerEnd();
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
        executor.shutdown();
    }

    private void handleTimerEnd() {
        GameStatus currentStatus = room.getGameStatus();
        GameStatus nextStatus = NEXT_STATUS.get(currentStatus);
        
        if (nextStatus != null) {
            room.setGameStatus(nextStatus);
            room.setCurrentTime(getDefaultTime(nextStatus));
            socketController.broadcastGameState(room);
            start(); // 다음 단계 타이머 시작
        }
    }

    public static int getDefaultTime(GameStatus status) {
        return DEFAULT_TIMES.getOrDefault(status, 0);
    }
}
