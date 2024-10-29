import React, { useState, useEffect } from 'react';
import '../styles/components/Timer.css';

const stages = ["낮", "밤", "마피아투표", "최후의변론", "사형투표"];
const stageDurations = { 낮: 60, 밤: 60, 마피아투표: 30, 최후의변론: 60, 사형투표: 10 };    // 단계별 시간 세팅

const Timer = () => {
  const [time, setTime] = useState(stageDurations[stages[0]]);
  const [stageIndex, setStageIndex] = useState(0);
  const [dayCount, setDayCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime > 1) {
          return prevTime - 1;
        } else {
          // 각 단계별로 이동 (일단은 마피아 투표의 규칙 적용 X 한사이클 돌리게 설정해둠)
          const nextStageIndex = (stageIndex + 1) % stages.length;
          setStageIndex(nextStageIndex);

          // 한 사이클이 끝나면 다시 낮으로 이동 & 일 수 +1
          if (nextStageIndex === 0) {
            setDayCount((prevDay) => prevDay + 1);
          }
          return stageDurations[stages[nextStageIndex]];
        }
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [stageIndex]);

  // 시간은 0:09초 와 같은 형태로 나타나게 설정
  return (
    <div className="timer">
      <span>⏰</span>
      <span>{`0:${time.toString().padStart(2, '0')}`}</span>
      <div className="stage-info">
        {dayCount}일차 {stages[stageIndex]}
      </div>
    </div>
  );
};

export default Timer;
