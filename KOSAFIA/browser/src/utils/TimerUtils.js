// 시간 지정
export const stageDurations = {
  
  NIGHT: 10,
  // 1.TargetUpdate(Player의 Target상태들 업데이트)  -> 2.Socket
  // -> 3. NighatResult(Players를 받아야함 / Player의 alive 상태들 업데이트)
  // -> 4. Socket
  DELAY: 5,
  DAY: 10,
  VOTE: 10,
  FINALVOTE: 30,
};

// 주어진 단계 인덱스를 기준으로 다음 단계를 가져옴
export const getNextStageIndex = (currentIndex, totalStages) => {
  return (currentIndex + 1) % totalStages;
};

// 주어진 시간에 맞게 증가/감소 기능 (최소 0초)
export const adjustTime = (currentTime, adjustment) => {
  return Math.max(currentTime + adjustment, 0);
};
