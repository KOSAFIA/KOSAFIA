package com.kosafia.gameapp.models.chat;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 게임방 입장 정보를 담는 DTO
 */

@Data
public class JoinMessageDTO {
    private String roomId;           // 입장할 게임방 ID
    private String userId;           // 입장하는 사용자 ID
    private String userName;         // 사용자 닉네임
    private LocalDateTime joinTime;  // 입장 시간
}