//  게임스테이터스 Java enum과 동일한 순서로 정의
export const GAME_STATUS = {
    NIGHT: 'NIGHT',        // 2
    DELAY: 'DELAY',        // 3
    DAY: 'DAY',            // 4
    VOTE: 'VOTE',          // 5
    FINALVOTE: 'FINALVOTE' // 6
};

// 상태 전환 매핑
export const NEXT_STATUS = {
    [GAME_STATUS.NIGHT]: GAME_STATUS.DELAY,
    [GAME_STATUS.DELAY]: GAME_STATUS.DAY,
    [GAME_STATUS.DAY]: GAME_STATUS.VOTE,
    [GAME_STATUS.VOTE]: GAME_STATUS.FINALVOTE,
    [GAME_STATUS.FINALVOTE]: GAME_STATUS.NIGHT
};

// 상태별 지속 시간 (초)
export const STATUS_DURATION = {
    [GAME_STATUS.NIGHT]: 60,     // 1분
    [GAME_STATUS.DELAY]: 5,      // 5초
    [GAME_STATUS.DAY]: 120,      // 2분
    [GAME_STATUS.VOTE]: 30,      // 30초
    [GAME_STATUS.FINALVOTE]: 15  // 15초
};

// 상태 인덱스 매핑 (Java enum ordinal과 동일)
export const STATUS_INDEX = {
    [GAME_STATUS.NIGHT]: 0,
    [GAME_STATUS.DELAY]: 1,
    [GAME_STATUS.DAY]: 2,
    [GAME_STATUS.VOTE]: 3,
    [GAME_STATUS.FINALVOTE]: 4
}; 