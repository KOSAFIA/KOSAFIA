//  게임스테이터스 Java enum과 동일한 순서로 정의
export const GAME_STATUS = {
  NIGHT: "NIGHT", // 0
  FIRST_DELAY: "FIRST_DELAY", // 1
  DAY: "DAY", // 2
  SECOND_DELAY: "SECOND_DELAY", //3
  VOTE: "VOTE", // 4
  THIRD_DELAY: "THIRD_DELAY", //5
  FINALVOTE: "FINALVOTE", // 6
  FOURTH_DELAY: "FOURTH_DELAY",
};

// 상태 전환 매핑
export const NEXT_STATUS = {
  [GAME_STATUS.NIGHT]: GAME_STATUS.FIRST_DELAY,
  [GAME_STATUS.FIRST_DELAY]: GAME_STATUS.DAY,
  [GAME_STATUS.DAY]: GAME_STATUS.SECOND_DELAY,
  [GAME_STATUS.SECOND_DELAY]: GAME_STATUS.VOTE,
  [GAME_STATUS.VOTE]: GAME_STATUS.THIRD_DELAY,
  [GAME_STATUS.THIRD_DELAY]: GAME_STATUS.FINALVOTE,
  [GAME_STATUS.FINALVOTE]: GAME_STATUS.FOURTH_DELAY,
  [GAME_STATUS.FOURTH_DELAY]: GAME_STATUS.NIGHT,
};

// 상태별 지속 시간 (초)
export const STATUS_DURATION = {
  [GAME_STATUS.NIGHT]: 60, // 1분
  [GAME_STATUS.FIRST_DELAY]: 5, // 5초
  [GAME_STATUS.DAY]: 120, // 2분
  [GAME_STATUS.SECOND_DELAY]: 5, // 5초
  [GAME_STATUS.VOTE]: 30, // 30초
  [GAME_STATUS.THIRD_DELAY]: 5, // 5초
  [GAME_STATUS.FINALVOTE]: 15, // 15초
  [GAME_STATUS.FOURTH_DELAY]: 5, // 5초
};

// 상태 인덱스 매핑 (Java enum ordinal과 동일)
export const STATUS_INDEX = {
  [GAME_STATUS.NIGHT]: 0,
  [GAME_STATUS.FIRST_DELAY]: 1,
  [GAME_STATUS.DAY]: 2,
  [GAME_STATUS.SECOND_DELAY]: 3,
  [GAME_STATUS.VOTE]: 4,
  [GAME_STATUS.THIRD_DELAY]: 5,
  [GAME_STATUS.FINALVOTE]: 6,
  [GAME_STATUS.FOURTH_DELAY]: 7,
};

export const GAME_PHASES = {
  [GAME_STATUS.NIGHT]: {
    name: "밤",
    duration: 60,
    image: "/img/night.png",
  },
  [GAME_STATUS.FIRST_DELAY]: {
    name: "전환",
    duration: 5,
    image: "/img/discussion.png",
  },
  [GAME_STATUS.DAY]: {
    name: "낮",
    duration: 120,
    image: "/img/day.png",
  },
  [GAME_STATUS.SECOND_DELAY]: {
    name: "전환",
    duration: 5,
    image: "/img/discussion.png",
  },
  [GAME_STATUS.VOTE]: {
    name: "투표",
    duration: 30,
    image: "/img/vote.png",
  },
  [GAME_STATUS.THIRD_DELAY]: {
    name: "전환",
    duration: 5,
    image: "/img/discussion.png",
  },
  [GAME_STATUS.FINALVOTE]: {
    name: "최후투표",
    duration: 15,
    image: "/img/discussion.png",
  },
  [GAME_STATUS.FOURTH_DELAY]: {
    name: "전환",
    duration: 5,
    image: "/img/discussion.png",
  },
};
