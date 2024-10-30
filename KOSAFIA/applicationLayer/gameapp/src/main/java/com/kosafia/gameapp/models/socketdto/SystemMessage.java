package com.kosafia.gameapp.models.socketdto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 시스템 메시지를 전달하는 DTO
 */
@Data
@AllArgsConstructor
public class SystemMessage {
    private String roomId;           // 게임방 ID
    private String message;          // 시스템 메시지 내용
    private LocalDateTime timestamp; // 메시지 생성 시간

    public SystemMessage(String roomId, String message) {
        this.roomId = roomId;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}