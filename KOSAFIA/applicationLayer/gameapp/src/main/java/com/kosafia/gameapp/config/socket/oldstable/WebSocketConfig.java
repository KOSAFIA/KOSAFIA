// package com.kosafia.gameapp.config.socket.oldstable;

// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.socket.config.annotation.EnableWebSocket;
// import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
// import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

// import com.kosafia.gameapp.handler.ChatHandler;

// @Configuration //스프링부트에서 제공하는 설정클래스 어노테이션
// @EnableWebSocket //스프링 부트에서 제공하는 웹소켓 클래스 어노테이션
// public class WebSocketConfig implements WebSocketConfigurer{

//     @Override
//     public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
//         registry.addHandler(new ChatHandler(), "/ws/chat")  // WebSocket 엔드포인트 설정
//                .setAllowedOrigins("*");  // CORS 설정
//     }

// }
