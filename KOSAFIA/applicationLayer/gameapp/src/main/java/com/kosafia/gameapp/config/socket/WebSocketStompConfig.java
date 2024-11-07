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
@EnableWebSocketMessageBroker
public class WebSocketStompConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 메시지를 구독할 때 사용할 경로를 설정합니다.
        registry.enableSimpleBroker("/topic", "/queue");
        // 클라이언트가 메시지를 보낼 때 사용할 경로를 설정합니다.
        registry.setApplicationDestinationPrefixes("/fromapp");
        log.info("Message broker configured with prefixes: /topic, /queue, /fromapp");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트가 연결할 수 있는 WebSocket 엔드포인트를 설정합니다.
        registry.addEndpoint("/wstomp")
                .setAllowedOriginPatterns("*") // 모든 도메인에서의 요청을 허용합니다.
                .withSockJS();  // SockJS를 사용하여 WebSocket을 지원합니다.
        log.info("STOMP endpoint registered at /wstomp with SockJS support");
    }

    @Bean
    public WebSocketTransportRegistration webSocketTransportRegistration() {
        // WebSocket 전송 설정을 구성합니다.
        WebSocketTransportRegistration registration = new WebSocketTransportRegistration()
                .setMessageSizeLimit(128 * 1024) // 메시지 크기 제한을 설정합니다.
                .setSendTimeLimit(20 * 1000) // 메시지 전송 시간 제한을 설정합니다.
                .setSendBufferSizeLimit(512 * 1024); // 전송 버퍼 크기 제한을 설정합니다.
        log.info("WebSocket transport registration configured with message size limit: 128KB, send time limit: 20s, buffer size limit: 512KB");
        return registration;
    }

    @Override
    public boolean configureMessageConverters(List<MessageConverter> messageConverters) {
        // 메시지 변환기를 설정합니다.
        DefaultContentTypeResolver resolver = new DefaultContentTypeResolver();
        resolver.setDefaultMimeType(MimeTypeUtils.APPLICATION_JSON);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());  // Java 8 날짜/시간 모듈을 등록합니다.
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);  // 날짜를 ISO-8601 형식으로 직렬화합니다.

        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(objectMapper);
        converter.setContentTypeResolver(resolver);

        messageConverters.add(converter);
        log.info("Message converters configured with JSON support");
        return false;
    }
}
