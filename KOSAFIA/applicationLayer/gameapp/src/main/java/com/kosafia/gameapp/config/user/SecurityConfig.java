package com.kosafia.gameapp.config.user;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration // 이 클래스가 설정 클래스임을 나타냄 //Spring 애플리케이션의 설정 정보를 포함하는 클래스로 간주
@EnableWebSecurity // Spring Security를 활성화
public class SecurityConfig {

        // BCryptPasswordEncoder 빈 등록
        @Bean //@Bean이 붙은 메서드가 반환하는 객체는 Spring 컨테이너에 의해 관리되는 빈이 됩니다.//필요할 때마다 컨테이너에서 주입하여 재사용할 수 있습니다.
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(); // 비밀번호 암호화를 위해 BCrypt 사용
        }

        // SecurityFilterChain 빈을 사용하여 보안 설정
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                // CSRF 비활성화
                                .csrf(csrf -> csrf.disable()) // CSRF 공격 방어를 비활성화 (API 서버일 경우 일반적으로 비활성화)

                                // 요청에 대한 인증 설정
                                .authorizeHttpRequests(authz -> authz
                                                .requestMatchers(
                                                                "/", "/index.html", "/react", "/react/**", "/static/**", // 정적
                                                                                                                         // 파일
                                                                                                                         // 요청
                                                                                                                         // 허용
                                                                "/css/**", "/js/**", // CSS 및 JS 파일 접근 허용
                                                                "/api/user/register", "/api/user/login",
                                                                "/api/user/profile", // 회원가입, 로그인, 프로필 조회
                                                                "/api/user/logout", "/api/user/update-username",
                                                                "/api/user/update-password", "/api/user/delete", // 사용자
                                                                                                                 // 관련
                                                                                                                 // API
                                                                                                                 // 허용
                                                                "/img/**", "/custom-login" // 이미지 파일과 로그인 페이지 허용
                                                                ,"/api/room","/TestLobby"
                                                ).permitAll() // 위의 경로들에 대해 인증 없이 접근 허용

                                                .anyRequest().authenticated() // 나머지 모든 요청은 인증 필요
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

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.session.HttpSessionEventPublisher;
// import org.springframework.web.cors.CorsConfiguration;
// import org.springframework.web.cors.CorsConfigurationSource;
// import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
// import org.springframework.web.filter.CorsFilter;

// import java.util.List;

// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();  // 비밀번호 암호화를 위해 BCrypt 사용
//     }

//     @SuppressWarnings("deprecation")
// @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//         http
//                 // CORS 설정 및 CSRF 비활성화
//                 .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                 .csrf(AbstractHttpConfigurer::disable)

//                 // 권한 설정
//                 .authorizeHttpRequests(auth -> {
//                         auth.requestMatchers(
//                                 "/", "/index.html", "/react/**", "/static/**",
//                                 "/css/**", "/js/**", "/img/**", "/custom-login",
//                                 "/api/user/register", "/api/user/login", "/api/user/profile",
//                                 "/api/user/logout", "/api/user/update-username",
//                                 "/api/user/update-password", "/api/user/delete",
//                                 "/api/room", "/public/**","**/TestLobby/"
//                         ).permitAll();
//                         auth.anyRequest().authenticated();
//                     })
                    

//                 // 로그아웃 설정
//                 .logout(logout -> logout
//                         .logoutUrl("/api/user/logout")
//                         .logoutSuccessUrl("/") // 로그아웃 성공 후 이동할 경로
//                         .invalidateHttpSession(true)
//                         .deleteCookies("JSESSIONID")
//                 )

//                 // 세션 관리 설정
//                 .sessionManagement(session -> session
//                         .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 필요 시에만 세션 생성
//                 );

//         return http.build();
//     }

//     // CORS 설정을 범용적으로 적용
//     @Bean
//     public CorsConfigurationSource corsConfigurationSource() {
//         CorsConfiguration configuration = new CorsConfiguration();
//         configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:8080")); // 프론트엔드 도메인 추가
//         configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // 허용할 HTTP 메소드
//         configuration.setAllowedHeaders(List.of("Authorization", "Content-Type")); // 허용할 헤더
//         configuration.setAllowCredentials(true); // 자격 증명 포함 허용

//         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//         source.registerCorsConfiguration("/**", configuration);
//         return source;
//     }
// }