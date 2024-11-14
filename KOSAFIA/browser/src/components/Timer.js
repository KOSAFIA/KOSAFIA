import React, { useState, useEffect } from "react";
import { STATUS_DURATION, GAME_STATUS, STATUS_INDEX } from "../constants/GameStatus";
import "../styles/components/Timer.css";

const stages = [
  { name: "NONE", image: "/img/discussion.png" },
  { name: "DAY", image: "/img/day.png" },
  { name: "NIGHT", image: "/img/night.png" },
  { name: "DELAY", image: "/img/discussion.png" },
  { name: "VOTE", image: "/img/vote.png" },
  { name: "FINALVOTE", image: "/img/judgement.png" },
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

  const canModifyTime = () => {
    return gameStatus === GAME_STATUS.DAY && !hasModifiedTime;
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

  // 게임 상태에 따른 한글 표시 매핑 추가
  const stageNames = {
    [GAME_STATUS.NONE]: "대기",
    [GAME_STATUS.DAY]: "낮",
    [GAME_STATUS.NIGHT]: "밤",
    [GAME_STATUS.DELAY]: "전환",
    [GAME_STATUS.VOTE]: "투표",
    [GAME_STATUS.FINALVOTE]: "최후투표"
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
