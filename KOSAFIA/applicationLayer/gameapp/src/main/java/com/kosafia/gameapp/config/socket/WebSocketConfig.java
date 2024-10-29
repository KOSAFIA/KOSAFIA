package com.kosafia.gameapp.config.socket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


/**
 * WebSocket 설정을 담당하는 설정 클래스
 * STOMP 프로토콜을 사용하여 웹소켓 통신을 구성
 */
@Configuration
@EnableWebSocketMessageBroker  // 웹소켓 메시지 브로커 활성화
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    /**
     * 메시지 브로커 설정
     * @param config 메시지 브로커 레지스트리
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 구독 주제(subscribe)의 prefix 설정
        config.enableSimpleBroker("/topic", "/queue");
        // 클라이언트에서 메시지 송신 시 사용할 prefix
        config.setApplicationDestinationPrefixes("/app");
    }
    
    /**
     * WebSocket 엔드포인트 등록
     * @param registry STOMP 엔드포인트 레지스트리
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // SockJS를 통한 웹소켓 연결 엔드포인트 설정
        registry.addEndpoint("/ws-mafia")
               .setAllowedOrigins("*")  // CORS 설정
               .withSockJS();           // SockJS 지원 활성화
    }
}