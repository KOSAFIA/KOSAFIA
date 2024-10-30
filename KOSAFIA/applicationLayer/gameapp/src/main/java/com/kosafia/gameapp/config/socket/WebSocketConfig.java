package com.kosafia.gameapp.config.socket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

/**
 * WebSocket 설정을 담당하는 클래스
 * 책임: WebSocket 엔드포인트와 메시지 브로커 설정
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 메시지 구독 주제(subscribe)의 prefix 설정
        config.enableSimpleBroker(
            "/topic",  // 일반적인 구독 주제
            "/queue"   // 특정 사용자를 위한 주제
        );
        
        // 클라이언트에서 메시지를 보낼 때 사용할 prefix
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-mafia")   // WebSocket 연결 엔드포인트
                .setAllowedOrigins("*")     // CORS 설정 (실제 운영에서는 구체적 도메인 지정)
                .withSockJS();              // SockJS 지원 활성화
    }
}