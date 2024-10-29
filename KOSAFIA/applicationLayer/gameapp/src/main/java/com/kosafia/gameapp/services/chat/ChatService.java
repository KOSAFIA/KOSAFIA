package com.kosafia.gameapp.services.chat;

import com.kosafia.gameapp.models.socketdto.ChatMessage;
import com.kosafia.gameapp.models.socketenum.GamePhase;

/**
 * 채팅 관련 기능을 정의하는 인터페이스
 */
public interface ChatService {
    void sendLobbyMessage(ChatMessage message);
    void sendRoomMessage(String roomId, ChatMessage message);
    void sendGameMessage(String roomId, GamePhase phase, String role, ChatMessage message);
}