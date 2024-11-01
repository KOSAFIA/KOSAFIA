import React, { useState, useEffect } from "react";
import { stageDurations, getNextStageIndex } from "../utils/TimerUtils";
import { changeTime, canModifyTime } from "../utils/TimeControlUtils";
import "../styles/components/Timer.css";

const stages = [
  { name: "낮", image: "/img/day.png" },
  { name: "마피아투표", image: "/img/vote.png" },
  { name: "최후의변론", image: "/img/discussion.png" },
  { name: "사형투표", image: "/img/judgement.png" },
  { name: "밤", image: "/img/night.png" },
];

const Timer = ({ onSendMessage, playerName }) => {
  const [time, setTime] = useState(stageDurations[stages[0].name]);
  const [stageIndex, setStageIndex] = useState(0);
  const [dayCount, setDayCount] = useState(1);
  const [hasModifiedTime, setHasModifiedTime] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime > 1) {
          return prevTime - 1;
        } else {
          const nextStageIndex = getNextStageIndex(stageIndex, stages.length);
          setStageIndex(nextStageIndex);

          // 낮 단계에서만 시간 조정 가능하도록 초기화 및 조건 설정
          if (stages[nextStageIndex].name === "낮") {
            setDayCount((prevDay) => prevDay + 1);
            setHasModifiedTime(false); // 새로운 날이 되면 초기화
          }

          return stageDurations[stages[nextStageIndex].name];
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stageIndex]);

  const handleIncreaseTime = () => {
    if (stages[stageIndex].name === "낮" && canModifyTime(hasModifiedTime)) {
      setTime((prevTime) => changeTime(prevTime, 10));
      onSendMessage(`${playerName} 님이 시간을 증가했습니다.`);
      setHasModifiedTime(true);
    }
  };

  const handleDecreaseTime = () => {
    if (stages[stageIndex].name === "낮" && canModifyTime(hasModifiedTime)) {
      setTime((prevTime) => changeTime(prevTime, -10));
      onSendMessage(`${playerName} 님이 시간을 감소했습니다.`);
      setHasModifiedTime(true);
    }
  };

  return (
    <div className="timer">
      <div className="stage-image">
        <img src={stages[stageIndex].image} alt={stages[stageIndex].name} />
      </div>
      <div className="time-display">
        <button className="button" onClick={handleIncreaseTime}>시간 증가</button>
        <span>&nbsp;⏰&nbsp;</span>
        <span>&nbsp;{`0:${time.toString().padStart(2, "0")}`}&nbsp;&nbsp;</span>
        <button className="button" onClick={handleDecreaseTime}>시간 감소</button>
      </div>
      <div className="stage-info">
        {dayCount}일차 {stages[stageIndex].name}
      </div>
    </div>
  );
};

export default Timer;
