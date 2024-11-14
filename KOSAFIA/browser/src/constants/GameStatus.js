//  게임스테이터스 Java enum과 동일한 순서로 정의
export const GAME_STATUS = {
    NONE: 'NONE',           // 0
    DAY: 'DAY',            // 1
    NIGHT: 'NIGHT',        // 2
    DELAY: 'DELAY',        // 3
    VOTE: 'VOTE',          // 4
    FINALVOTE: 'FINALVOTE' // 5
};

// 상태 전환 매핑
export const NEXT_STATUS = {
    [GAME_STATUS.DAY]: GAME_STATUS.NIGHT,
    [GAME_STATUS.NIGHT]: GAME_STATUS.VOTE,
    [GAME_STATUS.VOTE]: GAME_STATUS.FINALVOTE,
    [GAME_STATUS.FINALVOTE]: GAME_STATUS.DAY,
    [GAME_STATUS.DELAY]: null, // DELAY는 방장의 다음 상태 요청을 기다림
    [GAME_STATUS.NONE]: GAME_STATUS.DAY
};

// 상태별 지속 시간 (초)
export const STATUS_DURATION = {
    [GAME_STATUS.NONE]: 0,
    [GAME_STATUS.DAY]: 120,      // 2분
    [GAME_STATUS.NIGHT]: 60,     // 1분
    [GAME_STATUS.DELAY]: 5,      // 5초
    [GAME_STATUS.VOTE]: 30,      // 30초
    [GAME_STATUS.FINALVOTE]: 15  // 15초
};

// 상태 인덱스 매핑 (Java enum ordinal과 동일)
export const STATUS_INDEX = {
    [GAME_STATUS.NONE]: 0,
    [GAME_STATUS.DAY]: 1,
    [GAME_STATUS.NIGHT]: 2,
    [GAME_STATUS.DELAY]: 3,
    [GAME_STATUS.VOTE]: 4,
    [GAME_STATUS.FINALVOTE]: 5
}; 