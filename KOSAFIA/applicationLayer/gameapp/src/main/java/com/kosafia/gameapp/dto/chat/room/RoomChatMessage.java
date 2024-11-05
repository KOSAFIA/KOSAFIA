package com.kosafia.gameapp.dto.chat.room;

import lombok.*;

import java.time.*;
import java.util.*;

import com.kosafia.gameapp.models.user.User;


@Data
@Builder
public class RoomChatMessage {
    public enum MessageType {
        ENTER,      // 입장
        CHAT,       // 채팅
        LEAVE,      // 퇴장
        USER_LIST   // 유저 목록
    }
    
    private MessageType type;
    private String roomId;
    private String userId;
    private String username;
    private String content;
    private LocalDateTime timestamp;
    private List<User> users;  // USER_LIST 타입일 때 사용
}
