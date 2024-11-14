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
    switch (role) {
      case "MAFIA":
        onSendMessage({ text: `플레이어 ${playerNumber} (마피아)가 타겟을 선택합니다.` });
        break;
      case "DOCTOR":
        onSendMessage({ text: `플레이어 ${playerNumber} (의사)가 치료할 타겟을 선택합니다.` });
        break;
      case "POLICE":
        onSendMessage({ text: `플레이어 ${playerNumber} (경찰)가 조사할 타겟을 선택합니다.` });
        break;
      default:
        onSendMessage({ text: `밤이 되었습니다. 플레이어 ${playerNumber}의 역할은 시민입니다.` });
        break;
    }
  };

  const handleIncreaseTime = () => {
    if (stages[stageIndex].name === "낮" && canModifyTime(hasModifiedTime)) {
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
    if (stages[stageIndex].name === "낮" && canModifyTime(hasModifiedTime)) {
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
