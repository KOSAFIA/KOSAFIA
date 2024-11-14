package com.kosafia.gameapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // 애너테이션을 통해 스프링이 이 클래스를 설정 클래스로 인식하게 함
public class WebConfig implements WebMvcConfigurer {

    // 정적 리소스 핸들러 설정 - React 빌드 파일 등 정적 자원을 제공하는 경로를 설정
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }

    // CORS(Cross-Origin Resource Sharing) 설정 - 다른 도메인(React 프론트엔드)에서 서버에 접근할 수 있도록
    // 허용
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // addMapping("/**")는 모든 경로에 대해 CORS 설정을 적용
                .allowedOrigins(
                        "http://localhost:3000", // 로컬 React 개발 서버
                        "https://definite-grackle-centrally.ngrok-free.app" // ngrok URL 추가
                ) // React 개발 서버 도메인(localhost:3000)에서 오는 요청을 허용
                .allowedMethods("*") // 모든 HTTP 메서드(GET, POST, PUT, DELETE 등)를 허용
                .allowedHeaders("*") // 모든 헤더를 허용 (클라이언트에서 다양한 정보를 포함하여 서버에 요청할 수 있도록 허용)
                .allowCredentials(true); // 자격 증명(쿠키, 인증 정보 등)을 허용하여 클라이언트가 서버에 인증된 요청을 보낼 수 있도록 함
    }

    // 이상하게 빠지는거 해결
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // React Router 경로들을 index.html로 포워딩
        registry.addViewController("/rooms/**").setViewName("forward:/index.html");
        registry.addViewController("/login").setViewName("forward:/index.html");
        registry.addViewController("/dashboard/**").setViewName("forward:/index.html");
    }
}
