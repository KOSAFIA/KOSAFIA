import React, { useState, useEffect } from "react";
import { stageDurations, getNextStageIndex } from "../utils/TimerUtils";
import { changeTime, canModifyTime } from "../utils/TimeControlUtils";
import "../styles/components/Timer.css";

const stages = [
  { name: "NIGHT", image: "/img/night.png" },
  { name: "DELAY", image: "/img/day.png" },  // 로딩용 임시 
  { name: "DAY", image: "/img/day.png" },
  { name: "VOTE", image: "/img/vote.png" },
  { name: "FINALVOTE", image: "/img/discussion.png" },
];

const Timer = ({ onSendMessage, playerNumber, onStageChange, role }) => {
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

          if (stages[nextStageIndex].name === "낮") {
            setDayCount((prevDay) => prevDay + 1);
            setHasModifiedTime(false);
          }

          // 밤 단계일 때 역할 처리
          if (stages[nextStageIndex].name === "밤") {
            handleNightRoleAction();
          }

          onStageChange(nextStageIndex);

          return stageDurations[stages[nextStageIndex].name];
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stageIndex, onStageChange]);

  const handleNightRoleAction = () => {
    const nightActionData = {
      playerNumber,
      role,
    };

    // 확인용 text 넣기
    switch (role) {
      case "MAFIA":
        nightActionData.text = `마피아 ${playerNumber}번이 타겟을 선택 중입니다.`;
        break;
      case "DOCTOR":
        nightActionData.text = `의사 ${playerNumber}번이 치료할 타겟을 선택 중입니다.`;
        break;
      case "POLICE":
        nightActionData.text = `경찰 ${playerNumber}번이 조사할 타겟을 선택 중입니다.`;
        break;
      default:
        nightActionData.text = `시민 ${playerNumber}번이 역할을 수행하지 않습니다.`;
    }

    onSendMessage(nightActionData);
  };

  const handleIncreaseTime = () => {
    if (stages[stageIndex].name === "DAY" && canModifyTime(hasModifiedTime)) {
      setTime((prevTime) => changeTime(prevTime, 10));
      onSendMessage({
        text: `${playerNumber}번 플레이어가 시간을 증가했습니다.`,
        player: playerNumber,
        isTimeModifiedMessage: true,
      });
      setHasModifiedTime(true);
    }
  };

  const handleDecreaseTime = () => {
    if (stages[stageIndex].name === "DAY" && canModifyTime(hasModifiedTime)) {
      setTime((prevTime) => changeTime(prevTime, -10));
      onSendMessage({
        text: `${playerNumber}번 플레이어가 시간을 감소했습니다.`,
        player: playerNumber,
        isTimeModifiedMessage: true,
      });
      setHasModifiedTime(true);
    }
  };

  return (
    <div className="timer">
      <div className="stage-image">
        <img src={stages[stageIndex].image} alt={stages[stageIndex].name} />
      </div>
      <div className="time-display">
        <div className="timer-button-wrapper">
          <button
            className="button decrease-time"
            onClick={handleDecreaseTime}
          ></button>
          <span>
            &nbsp;{`0:${time.toString().padStart(2, "0")}`}&nbsp;&nbsp;
          </span>
          <button
            className="button increase-time"
            onClick={handleIncreaseTime}
          ></button>
        </div>
      </div>
      <div className="stage-info">
        {dayCount}일차 {stages[stageIndex].name}
      </div>
    </div>
  );
};

export default Timer;