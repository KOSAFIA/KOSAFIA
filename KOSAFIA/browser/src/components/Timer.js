import React, { useState, useEffect } from "react";
import { stageDurations, getNextStageIndex } from "../utils/TimerUtils";
import { changeTime, canModifyTime } from "../utils/TimeControlUtils";
import "../styles/components/Timer.css";

const stages = [
  { name: "NIGHT", image: "/img/night.png" },
  { name: "DELAY", image: "/img/day.png" },
  { name: "DAY", image: "/img/day.png" },
  { name: "VOTE", image: "/img/vote.png" },
  { name: "FINALVOTE", image: "/img/discussion.png" },
];

const Timer = ({ onSendMessage, playerNumber, onStageChange, role, gameStatus }) => {
  //컴포넌트 마운트 시 호출되는 구현부입니다.
  const [time, setTime] = useState(stageDurations[gameStatus]);
  const [stageIndex, setStageIndex] = useState(0);
  const [dayCount, setDayCount] = useState(1);
  const [hasModifiedTime, setHasModifiedTime] = useState(false);

  // 게임스테이터스, 스테이지 인덱스, 온 센드메시지를 계속 감시합니다.
  useEffect(() => {
     // 1. 새로운 단계의 시간으로 초기화
    setTime(stageDurations[gameStatus]);
    // 2. 스테이지 인덱스 업데이트
    setStageIndex(stages.findIndex(stage => stage.name === gameStatus));
    // 3. 시작 메시지 전송
    onSendMessage({
      text: `${stages[stageIndex].name} 시간이 시작되었습니다.`,
      isSystemMessage: true
    });
  }, [gameStatus, stageIndex, onSendMessage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          // 1. 타이머 정지
          clearInterval(timer);
          // 2. 종료 메시지 전송
          onSendMessage({
            text: `${stages[stageIndex].name} 시간이 종료되었습니다.`,
            isSystemMessage: true
          });
          // 3. 단계 변경 트리거
          onStageChange(stageIndex);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stageIndex, onSendMessage, onStageChange]);

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
            disabled={stages[stageIndex].name !== "DAY" || hasModifiedTime}
          />
          <span>
            {`${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`}
          </span>
          <button
            className="button increase-time"
            onClick={handleIncreaseTime}
            disabled={stages[stageIndex].name !== "DAY" || hasModifiedTime}
          />
        </div>
      </div>
      <div className="stage-info">
        {dayCount}일차 {stages[stageIndex].name}
      </div>
    </div>
  );
};

export default Timer;