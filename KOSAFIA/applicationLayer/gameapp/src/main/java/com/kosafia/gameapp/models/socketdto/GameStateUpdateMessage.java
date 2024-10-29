package com.kosafia.gameapp.models.socketdto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

import com.kosafia.gameapp.models.socketenum.GamePhase;

/**
 * 게임 상태 변경 정보를 전달하는 DTO
 */
@Builder
@Data
public class GameStateUpdateMessage {
    private String roomId;           // 게임방 ID
    private GamePhase phase;         // 변경된 게임 페이즈
    private LocalDateTime timestamp; // 상태 변경 시간
    private Map<String, Object> additionalData; // 추가 데이터 (필요한 경우)
}