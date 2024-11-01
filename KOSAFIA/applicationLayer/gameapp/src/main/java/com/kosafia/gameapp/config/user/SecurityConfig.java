package com.kosafia.gameapp.config.user;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        // BCryptPasswordEncoder 빈 등록
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        // SecurityFilterChain 빈을 사용하여 보안 설정
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable()) // CSRF 비활성화 (API 서버일 경우)
                                .authorizeHttpRequests(authz -> authz
                                                .requestMatchers(
                                                                "/", "/index.html", "/react", "/react/**", "/static/**",
                                                                "/css/**", "/js/**",
                                                                "/api/user/register", "/api/user/login",
                                                                "/api/user/profile",
                                                                "/api/user/logout", "/api/user/update-username",
                                                                "/api/user/update-password",
                                                                "/api/user/delete", // 회원탈퇴 경로 추가
                                                                "/img/**", "/custom-login")
                                                .permitAll() // 인증 없이 접근 허용 경로 추가
                                                .anyRequest().authenticated() // 나머지 요청은 인증 필요
                                )
                                .logout(logout -> logout
                                                .logoutUrl("/api/user/logout") // 로그아웃 URL 설정
                                                .logoutSuccessUrl("/") // 로그아웃 성공 후 리디렉션 URL
                                                .invalidateHttpSession(true) // 세션 무효화
                                                .deleteCookies("JSESSIONID") // 세션 쿠키 삭제
                                )
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 세션이 필요할 때만
                                                                                                          // 생성
                                );

                return http.build();
        }
}
