package com.kosafia.gameapp.handler;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class StompHandler implements ChannelInterceptor {
    
    private final ConcurrentHashMap<String, String> sessionUserMap = new ConcurrentHashMap<>();

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        String sessionId = accessor.getSessionId();
        StompCommand command = accessor.getCommand();

        if (command == null) return message;

        switch (command) {
            case CONNECT:
                // 연결 시작
                log.info("STOMP Connect [session id: {}]", sessionId);
                break;

            case SUBSCRIBE:
                // 구독 시작
                String destination = accessor.getDestination();
                log.info("STOMP Subscribe [session id: {}, destination: {}]", sessionId, destination);
                break;

            case DISCONNECT:
                // 연결 종료
                log.info("STOMP Disconnect [session id: {}]", sessionId);
                sessionUserMap.remove(sessionId);
                break;

            case SEND:
                // 메시지 전송
                String payload = new String((byte[]) message.getPayload());
                log.info("STOMP Message [session id: {}, payload: {}]", sessionId, payload);
                break;

            default:
                break;
        }

        return message;
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor == null) return;

        String sessionId = accessor.getSessionId();
        StompCommand command = accessor.getCommand();

        if (command == null) return;

        // 메시지 전송 완료 후 에러 체크
        if (ex != null) {
            log.error("Message handling error [session id: {}, command: {}]", sessionId, command, ex);
            return;
        }

        // 메시지 전송 성공 로그
        if (sent) {
            log.debug("Message sent successfully [session id: {}, command: {}]", sessionId, command);
        }
    }
}