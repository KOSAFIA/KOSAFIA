package com.kosafia.gameapp.config.user;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import com.kosafia.gameapp.services.user.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration // 이 클래스가 설정 클래스임을 나타냄 //Spring 애플리케이션의 설정 정보를 포함하는 클래스로 간주
@EnableWebSecurity // 스프링 시큐리티를 활성화하여 보안 기능 적용
public class SecurityConfig {

        @Autowired // UserService를 스프링 컨테이너로부터 주입받아 사용할 수 있도록 설정
        private UserService userService;

        // 비밀번호 암호화에 사용할 BCryptPasswordEncoder를 빈으로 등록
        // 필요할 때마다 컨테이너에서 주입하여 @Bean이 붙은 메서드가 반환하는 객체는 Spring 컨테이너에 의해 관리되는 빈이 됩니다.
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(); // 비밀번호를 BCrypt 방식으로 암호화하여 보안 강화
        }

        // SecurityFilterChain 빈을 사용하여 보안 설정
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http

                                // CSRF 보호 비활성화 (API 서버일 경우 비활성화하는 경우가 많음)
                                .csrf(csrf -> csrf.disable()) // CSRF 공격 방어를 비활성화 (API 서버일 경우 일반적으로 비활성화)

                                // 요청에 대한 인증/인가 설정
                                .authorizeHttpRequests(authz -> authz
                                                .requestMatchers( // 정적 리소스 (HTML, CSS, JS, 이미지)와 특정 API 엔드포인트에 대한 접근 허용
                                                                "/", "/Login", "/index.html", "/react", "/react/**",
                                                                "/static/**", // 정적
                                                                // 파일
                                                                // 요청
                                                                // 허용
                                                                "/css/**", "/js/**", // CSS 및 JS 파일 접근 허용
                                                                "/api/user/**",
                                                                "/img/**", "/custom-login" // 이미지 파일과 로그인 페이지 허용
                                                                , "/api/room", "/TestLobby",
                                                                "/LoginOk", "/rooms/**", "/api/rooms", "/api/rooms/**", // 특정
                                                                "/register", // 경로
                                                                             // 접근
                                                                             // 허용
                                                                "/rooms" // LoginOk 경로를 인증 없이 접근 가능하도록 허용
                                                ).permitAll() // 위의 경로들에 대해 인증 없이 접근 허용

                                                .anyRequest().authenticated() // 나머지 모든 요청은 인증 필요
                                )
                                // .authorizeHttpRequests(authz -> authz
                                // .requestMatchers("/Login", "/", "/index.html",
                                // "/react", "/react/**", "/static/**", "/css/**",
                                // "/js/**",
                                // "/img/**", "/custom-login", "/register", "/LoginOk")
                                // .permitAll() // "/Login" 경로만 인증 없이 접근 허용
                                // .anyRequest().authenticated() // 나머지 모든 요청에 대해 인증 필요
                                // )

                                // OAuth2 로그인 설정 - 로그인 성공 시와 실패 시 처리
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler((request, response, authentication) -> {
                                                        // OAuth2User 객체에서 인증된 사용자 정보를 가져옴
                                                        OAuth2User oAuth2User = (OAuth2User) authentication
                                                                        .getPrincipal();
                                                        // 사용자 정보(Map 형태)를 가져와 세션에 저장
                                                        Map<String, Object> userAttributes = oAuth2User.getAttributes();
                                                        HttpSession session = request.getSession();
                                                        userService.processOAuth2User(userAttributes, session); // OAuth2
                                                                                                                // 사용자
                                                                                                                // 정보 처리
                                                        response.sendRedirect("/LoginOk"); // 성공 시 리디렉션
                                                })
                                                .failureUrl("/custom-login?error=true") // 실패 시 리디렉션할 URL
                                )
                                // 로그아웃 설정
                                .logout(logout -> logout
                                                .logoutUrl("/api/user/logout") // 로그아웃 경로 설정
                                                .logoutSuccessUrl("/") // 로그아웃 성공 후 리디렉션될 경로 설정
                                                .invalidateHttpSession(true) // 로그아웃 시 세션 무효화
                                                .deleteCookies("JSESSIONID") // 로그아웃 시 세션 쿠키 삭제
                                )

                                // 세션 관리 설정
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 세션이 필요한
                                                                                                          // 경우에만 세션 생성
                                );

                return http.build(); // 설정이 완료된 HttpSecurity 객체를 빌드하여 반환
        }
}
