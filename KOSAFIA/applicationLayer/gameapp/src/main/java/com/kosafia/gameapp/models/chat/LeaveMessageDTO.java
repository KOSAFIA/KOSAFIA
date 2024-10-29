package com.kosafia.gameapp.models.chat;


import lombok.Data;
import java.time.LocalDateTime;

/**
 * 게임방 퇴장 정보를 담는 DTO
 */
@Data
public class LeaveMessageDTO {
    private String roomId;           // 퇴장할 게임방 ID
    private String userId;           // 퇴장하는 사용자 ID
    private String userName;         // 사용자 닉네임
    private LocalDateTime leaveTime; // 퇴장 시간
}
