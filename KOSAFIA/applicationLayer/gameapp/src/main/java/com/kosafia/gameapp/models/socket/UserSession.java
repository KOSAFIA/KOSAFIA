package com.kosafia.gameapp.models.socket;

import lombok.*;

import com.kosafia.gameapp.models.user.User;

import java.time.*;

@Data
@Builder
public class UserSession {
    private String sessionId;
    private User user;
    private String currentRoomId;  // 현재 참여 중인 방 ID
    private LocalDateTime connectTime;
}
