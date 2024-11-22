package com.kosafia.gameapp.config.socket;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.DefaultContentTypeResolver;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.MessageConverter;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSocketMessageBroker  // WebSocket 메시지 브로커 활성화
public class WebSocketStompConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 1. 메시지 브로커 설정
        // /topic: 일대다 메시징(브로드캐스트)
        // /queue: 일대일 메시징(개인간 통신)
        registry.enableSimpleBroker("/topic", "/queue");
        
        // 2. 클라이언트->서버 메시지 라우팅 prefix 설정
        // 클라이언트가 "/fromapp"으로 시작하는 주소로 메시지를 보내면 해당 메시지는 @MessageMapping이 붙은 메서드로 라우팅됨
        registry.setApplicationDestinationPrefixes("/fromapp");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 3. WebSocket 연결 엔드포인트 설정
        // 클라이언트는 "ws://도메인/wstomp"로 WebSocket 연결을 초기화할 수 있음
        registry.addEndpoint("/wstomp")
                .setAllowedOriginPatterns("*")  // CORS 설정: 모든 도메인 허용
                .withSockJS();  // WebSocket을 지원하지 않는 브라우저를 위한 폴백 메커니즘 제공
    }

    
    @Bean // 4. WebSocket 전송 제한 설정 //커스텀 컴포넌트. 오버라이딩 대상은 아님.
    public WebSocketTransportRegistration webSocketTransportRegistration() {
        return new WebSocketTransportRegistration()
                .setMessageSizeLimit(128 * 1024)  // 최대 메시지 크기: 128KB
                .setSendTimeLimit(20 * 1000)      // 최대 전송 시간: 20초
                .setSendBufferSizeLimit(512 * 1024); // 버퍼 크기: 512KB
    }

    @Override // 5. JSON 메시지 변환기 설정
    public boolean configureMessageConverters(List<MessageConverter> messageConverters) {
        
        DefaultContentTypeResolver resolver = new DefaultContentTypeResolver();
        resolver.setDefaultMimeType(MimeTypeUtils.APPLICATION_JSON);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());  // Java 8 시간 타입 지원
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);  // ISO-8601 날짜 형식 사용

        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(objectMapper);
        converter.setContentTypeResolver(resolver);

        messageConverters.add(converter);
        return false;
    }
}
