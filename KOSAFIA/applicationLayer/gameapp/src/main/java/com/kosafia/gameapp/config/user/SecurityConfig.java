package com.kosafia.gameapp.config.user;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import static org.springframework.security.config.Customizer.withDefaults;
import com.kosafia.gameapp.models.user.UserData;
import com.kosafia.gameapp.services.user.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration // 이 클래스가 설정 클래스임을 나타냄 //Spring 애플리케이션의 설정 정보를 포함하는 클래스로 간주
@EnableWebSecurity // 스프링 시큐리티를 활성화하여 보안 기능 적용
public class SecurityConfig {

        @Autowired // UserService를 스프링 컨테이너로부터 주입받아 사용할 수 있도록 설정
        private UserService userService;

        @Autowired
        private ClientRegistrationRepository clientRegistrationRepository;

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
                                // .cors(withDefaults()) // CORS 설정 추가
                                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 설정 추가
                                // CSRF 보호 비활성화 (API 서버일 경우 비활성화하는 경우가 많음)
                                .csrf(csrf -> csrf.disable()) // CSRF 공격 방어를 비활성화 (API 서버일 경우 일반적으로 비활성화)

                                // 요청에 대한 인증/인가 설정
                                .authorizeHttpRequests(authz -> authz
                                                .requestMatchers(
                                                                "/", "/**", "/index.html", "/react", "/react/**",
                                                                "/static/**", "/TestLobby", // 정적
                                                                // 파일
                                                                // 요청
                                                                // 허용
                                                                "/css/**", "/js/**", "/css", "/js", // CSS 및 JS 파일 접근 허용
                                                                "/api/user/register", "/api/user/login", "/api/**",
                                                                "/api/user/profile", // 회원가입, 로그인, 프로필 조회
                                                                "/api/user/logout", "/api/user/update-username",
                                                                "/api/user/update-password", "/api/user/delete", // 사용자
                                                                                                                 // 관련
                                                                                                                 // API
                                                                                                                 // 허용
                                                                "/img/**", "/img", "/custom-login" // 이미지 파일과 로그인 페이지 허용
                                                                , "/api/room", "/api/rooms", "/api/room/**",
                                                                "/api/rooms/**", "/TestLobby", "/api/game/**",
                                                                "/api/game/", "/rooms", "/rooms/**",
                                                                "/LoginOk", "/Login", "/LoginOk/**", "/Login/**", // LoginOk
                                                                "/wstomp/**" // 경로를
                                                // 인증 없이
                                                // 접근
                                                // 가능하도록
                                                // 허용
                                                ).permitAll() // 위의 경로들에 대해 인증 없이 접근 허용

                                                .anyRequest().authenticated() // 나머지 모든 요청은 인증 필요
                                )

                                // OAuth2 로그인 설정 - 로그인 성공 시와 실패 시 처리
                                .oauth2Login(oauth2 -> oauth2
                                                .authorizationEndpoint(authorization -> authorization
                                                                .authorizationRequestResolver(
                                                                                customAuthorizationRequestResolver()))
                                                .successHandler((request, response, authentication) -> {
                                                        // OAuth2User 객체에서 인증된 사용자 정보를 가져옴
                                                        OAuth2User oAuth2User = (OAuth2User) authentication
                                                                        .getPrincipal();
                                                        // 사용자 정보(Map 형태)를 가져와 세션에 저장
                                                        Map<String, Object> userAttributes = oAuth2User.getAttributes();
                                                        HttpSession session = request.getSession();
                                                        UserData userData = userService
                                                                        .processOAuth2User(userAttributes, session); // OAuth2
                                                        // 사용자
                                                        // 정보 처리
                                                        // 세션에 사용자 데이터 저장
                                                        session.setAttribute("userData", userData);
                                                        // response.sendRedirect("/TestLobby"); // 성공 시 리디렉션
                                                        response.sendRedirect("/TestLobby"); // 성공 시 리디렉션
                                                })
                                                .failureUrl("/custom-login?error=true") // 실패 시 리디렉션할 URL
                                )
                                // 로그아웃 설정
                                .logout(logout -> logout
                                                .logoutUrl("/api/user/logout") // 로그아웃 경로 설정
                                                .logoutSuccessHandler((request, response, authentication) -> {
                                                        // Google 계정 로그아웃 후 메인 페이지로 리디렉션
                                                        response.sendRedirect("https://accounts.google.com/logout");
                                                        // response.sendRedirect("https://accounts.google.com/logout?continue=http://localhost:3000");
                                                })
                                                // .logoutSuccessUrl("/") // 로그아웃 성공 후 리디렉션될 경로 설정
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

        private OAuth2AuthorizationRequestResolver customAuthorizationRequestResolver() {
                DefaultOAuth2AuthorizationRequestResolver defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(
                                clientRegistrationRepository, "/oauth2/authorization");

                return new OAuth2AuthorizationRequestResolver() { // 익명 클래스 사용
                        @Override
                        public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
                                OAuth2AuthorizationRequest authorizationRequest = defaultResolver.resolve(request);
                                if (authorizationRequest != null) {
                                        Map<String, Object> additionalParameters = new HashMap<>(
                                                        authorizationRequest.getAdditionalParameters());
                                        additionalParameters.put("prompt", "select_account"); // 계정 선택 강제
                                        return OAuth2AuthorizationRequest.from(authorizationRequest)
                                                        .additionalParameters(additionalParameters)
                                                        .build();
                                }
                                return authorizationRequest;
                        }

                        @Override
                        public OAuth2AuthorizationRequest resolve(HttpServletRequest request,
                                        String clientRegistrationId) {
                                return defaultResolver.resolve(request, clientRegistrationId); // 기본 동작 유지
                        }
                };

        }

        // CORS 설정을 위한 빈 등록
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                // configuration.addAllowedOrigin("http://localhost:3000");
                // configuration.addAllowedOrigin("http://192.168.240.5:3000");
                configuration.addAllowedOriginPattern("*"); // 모든 도메인 허용 (특정 도메인으로 제한하려면 수정)
                configuration.addAllowedMethod("*"); // 모든 HTTP 메서드 허용
                configuration.addAllowedHeader("*"); // 모든 헤더 허용
                configuration.setAllowCredentials(true); // 인증 정보 포함 허용

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
