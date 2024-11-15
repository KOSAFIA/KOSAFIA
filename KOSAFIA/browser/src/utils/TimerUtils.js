// 시간 지정
export const stageDurations = {
    낮: 10,
    밤: 1000000,
    마피아투표: 10,
    최후의변론: 10,
    사형투표: 10,
    test : 5,
  };
  
  // 주어진 단계 인덱스를 기준으로 다음 단계를 가져옴
  export const getNextStageIndex = (currentIndex, totalStages) => {
    return (currentIndex + 1) % totalStages;
  };
  
  // 주어진 시간에 맞게 증가/감소 기능 (최소 0초)
  export const adjustTime = (currentTime, adjustment) => {
    return Math.max(currentTime + adjustment, 0);
  };