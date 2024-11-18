// 개발 환경과 프로덕션 환경을 구분하기 위한 환경 변수 확인
const isDevelopment = process.env.NODE_ENV === 'development';

// 기본 URL 설정
const DEV_API_URL = 'http://localhost:8080';
// const PROD_API_URL = 'https://your-production-domain.com';
const PROD_API_URL = 'http://localhost:8080';  // 프로덕션도 일단 localhost로

const DEV_WEBSOCKET_URL = 'http://localhost:8080/wstomp';
// const PROD_WEBSOCKET_URL = 'https://your-production-domain.com/wstomp';
const PROD_WEBSOCKET_URL = 'http://localhost:8080/wstomp';  // 프로덕션도 일단

// 환경에 따른 URL 설정
export const API_BASE_URL = isDevelopment ? DEV_API_URL : PROD_API_URL;
export const WEBSOCKET_URL = isDevelopment ? DEV_WEBSOCKET_URL : PROD_WEBSOCKET_URL;

// 기타 설정값들
export const CONFIG = {
  RECONNECT_DELAY: 5000,
  HEARTBEAT_INCOMING: 4000,
  HEARTBEAT_OUTGOING: 4000,
  SOCKET_ENDPOINTS: {
    // Subscribe 엔드포인트 (서버에서 받는 메시지)
    CHAT: '/topic/game.chat',
    MAFIA_CHAT: '/topic/game.chat.mafia',
    TIMER: '/topic/game.timer',
    GAME_STATE: '/topic/game.state',
    VOTE: '/topic/game.vote',
    PLAYERS: '/topic/game.players',
    SOUND: '/topic/game.sound',
    MAFIA_TARGET: '/topic/game.mafia.target'
  },
  SOCKET_PUBLISH: {
    // Publish 엔드포인트 (서버로 보내는 메시지)
    CHAT: '/game.chat',
    MAFIA_CHAT: '/game.chat.mafia',
    VOTE: '/game.vote',
    MAFIA_TARGET: '/game.mafia.target',
    GAME_START: '/game.start',
    VOTE_RESULT: '/game.vote.result',
    FINAL_VOTE_RESULT: '/game.finalvote.result',
    NIGHT_RESULT: '/game.night.result',
    TIMER_MODIFY: '/game.timer.modify',
    PLAYER_UPDATE: '/game.players.update',
    PLAYER_JOIN: '/game.players.join',
    SYSTEM: '/game.system'
  }
};