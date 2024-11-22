import React, { useState, useEffect } from "react";
import { GAME_PHASES, STATUS_INDEX } from "../constants/GameStatus";
import "../styles/components/Timer.css";

const Timer = ({
  time, // 서버에서 받은 시간
  gameStatus, // 현재 게임 상태
  dayCount, // 현재 일차
  onTimerEnd, // 타이머 종료 콜백
  onModifyTime, // 시간 조절 콜백
  canModifyTime, // 시간 조절 가능 여부
  currentPlayerIsAlive,
}) => {
  const [stageInfo, setStageInfo] = useState(GAME_PHASES[gameStatus]);

  // gameStatus 변경 시 초기화
  useEffect(() => {
    setStageInfo(GAME_PHASES[gameStatus] || { name: "알 수 없음", image: "" });
  }, [gameStatus]);

  // 타이머가 0이 되면 종료 처리
  useEffect(() => {
    if (time <= 0) {
      onTimerEnd();
    }
  }, [time, onTimerEnd]);

  return (
    <div className="timer">
      <div className="stage-image">
        <img src={stageInfo.image} alt={stageInfo.name} />
      </div>
      <div className="time-display">
        {gameStatus === "DAY" && canModifyTime && (
          <>
            <img
              className="decrease-time"
              src="/img/timer-minus.png" // 이미지 경로 설정
              alt="Decrease Time"
              onClick={() => currentPlayerIsAlive && onModifyTime(-15)} // 시간 감소
            />
          </>
        )}
        <span>
          {`${Math.floor((time || 0) / 60)}:${((time || 0) % 60)
            .toString()
            .padStart(2, "0")}`}
        </span>
        {gameStatus === "DAY" && canModifyTime && (
          <>
            <img
              className="increase-time"
              src="/img/timer-plus.png" // 이미지 경로 설정
              alt="Increase Time"
              onClick={() => currentPlayerIsAlive && onModifyTime(15)} // 시간 증가
            />
          </>
        )}
      </div>
      <div className="stage-info">
        {dayCount}일차 {stageInfo.name}
      </div>
    </div>
  );
};

export default Timer;
