package com.kosafia.gameapp.config.socket;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketStompConfig implements WebSocketMessageBrokerConfigurer{@Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // 구독 요청 prefix --> 소켓 연결할때
        registry.enableSimpleBroker("/topic", "/queue");

        // 메시지 발행 요청 prefix --> 메시지 보낼때
        registry.setApplicationDestinationPrefixes("/fromapp");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        registry.addEndpoint("/wstomp")
                .setAllowedOriginPatterns("*")
                .withSockJS();  // SockJS 지원 추가

                // SockJS 폴백 옵션을 위한 별도 엔드포인트
        registry.addEndpoint("/wstomp")
                .setAllowedOriginPatterns("*")
                .withSockJS()
                .setClientLibraryUrl("/webjars/sockjs-client/1.5.1/sockjs.min.js")  // SockJS 클라이언트 경로 지정
                .setWebSocketEnabled(true)
                .setSessionCookieNeeded(false);

    }

        // SockJS fallback options 추가
    @Bean
    public WebSocketTransportRegistration webSocketTransportRegistration() {
        return new WebSocketTransportRegistration()
                .setMessageSizeLimit(128 * 1024)
                .setSendTimeLimit(20 * 1000)
                .setSendBufferSizeLimit(512 * 1024);
    }
}
