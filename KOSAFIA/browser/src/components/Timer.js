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
  { name: "test", image: "/img/day.png" },  // 로딩용 임시 
];

const Timer = ({ onSendMessage, playerNumber, onTimerEnd, role, gameStatus }) => {
  const [time, setTime] = useState(STATUS_DURATION[gameStatus] || STATUS_DURATION[GAME_STATUS.DAY]);
  const [stageIndex, setStageIndex] = useState(STATUS_INDEX[gameStatus] || 0);
  const [dayCount, setDayCount] = useState(1);
  const [hasModifiedTime, setHasModifiedTime] = useState(false);

  // 게임 상태가 변경될 때마다 타이머 리셋
  useEffect(() => {
    const newStageIndex = STATUS_INDEX[gameStatus];
    if (newStageIndex !== undefined) {
      setStageIndex(newStageIndex);
      setTime(STATUS_DURATION[gameStatus]);
      
      // 밤이 되면 역할별 메시지 전송
      if (gameStatus === GAME_STATUS.NIGHT) {
        handleNightRoleAction();
      }
    }
  }, [gameStatus, role, playerNumber]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          onTimerEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimerEnd]);

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
    if (canModifyTime()) {
      setTime(prevTime => prevTime + 10);
      onSendMessage({
        text: `${playerNumber}번 플레이어가 시간을 증가했습니다.`,
        player: playerNumber,
        isTimeModifiedMessage: true,
      });
      setHasModifiedTime(true);
    }
  };

  const handleDecreaseTime = () => {
    if (canModifyTime()) {
      setTime(prevTime => Math.max(prevTime - 10, 10));
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
            &nbsp;{`${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, "0")}`}&nbsp;&nbsp;
          </span>
          <button
            className="button increase-time"
            onClick={handleIncreaseTime}
          ></button>
        </div>
      </div>
      <div className="stage-info">
        {dayCount}일차 {stageNames[gameStatus]}
      </div>
    </div>
  );
};

export default Timer;
