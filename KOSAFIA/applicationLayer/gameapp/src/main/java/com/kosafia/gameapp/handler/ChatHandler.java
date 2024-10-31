package com.kosafia.gameapp.handler;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.concurrent.ConcurrentHashMap;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ChatHandler extends TextWebSocketHandler {
    
    private static final ConcurrentHashMap<String, WebSocketSession> CLIENTS = 
        new ConcurrentHashMap<String, WebSocketSession>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        CLIENTS.put(session.getId(), session);
        log.info("클라이언트 접속 성공. 세션 ID: {}", session.getId());
        log.info("현재 접속 클라이언트 수: {}", CLIENTS.size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.info("메시지 수신. 세션 ID: {}, 내용: {}", session.getId(), payload);

        // 메시지 브로드캐스트
        for (WebSocketSession client : CLIENTS.values()) {
            if (client.isOpen()) {
                log.info("메시지 전송 to 세션 ID: {}", client.getId());
                client.sendMessage(message);
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("전송 에러 발생. 세션 ID: {}", session.getId(), exception);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        CLIENTS.remove(session.getId());
        log.info("클라이언트 접속 종료. 세션 ID: {}, 상태: {}", session.getId(), status);
        log.info("남은 클라이언트 수: {}", CLIENTS.size());
    }
}