import React, { useState, useEffect } from 'react';
import '../styles/components/Timer.css';

// 각 단계의 이름과 그에 해당하는 이미지 경로를 매핑
const   stages = [
  { name: "낮", image: "/img/day.png" },
  { name: "마피아투표", image: "/img/vote.png" },
  { name: "최후의변론", image: "/img/discussion.png" },
  { name: "사형투표", image: "/img/judgement.png" },
  { name: "밤", image: "/img/night.png" },
];

const stageDurations = { 
  낮: 60, 
  밤: 60, 
  마피아투표: 30, 
  최후의변론: 60, 
  사형투표: 10 
};

const Timer = () => {
  const [time, setTime] = useState(stageDurations[stages[0].name]);
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
          return stageDurations[stages[nextStageIndex].name];
        }
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [stageIndex]);

  return (
    <div className="timer">
      {/* 현재 단계에 맞는 이미지 표시 */}
      <div className="stage-image">
        <img src={stages[stageIndex].image} alt={stages[stageIndex].name} />
      </div>

      {/* 시간을 표시하는 곳 */}
      <div className="time-display">
        <span>⏰</span>
        <span>{`0:${time.toString().padStart(2, '0')}`}</span>
      </div>

      {/* 낮 & 밤 & ... 표시하는 곳 */}
      <div className="stage-info">
        {dayCount}일차 {stages[stageIndex].name}
      </div>
    </div>
  );
};

export default Timer;
