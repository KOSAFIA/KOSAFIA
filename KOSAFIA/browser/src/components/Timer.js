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

const Timer = ({ 
    time,                    // 서버에서 받은 시간
    gameStatus,             // 현재 게임 상태
    dayCount,               // 현재 일차
    onTimerEnd,             // 타이머 종료 콜백
    onModifyTime,          // 시간 조절 콜백
    canModifyTime          // 시간 조절 가능 여부
}) => {
    const [stageIndex, setStageIndex] = useState(0);
    const [hasEndedTimer, setHasEndedTimer] = useState(false);

    // gameStatus 변경 시 초기화
    useEffect(() => {
        setStageIndex(stages.findIndex(stage => stage.name === gameStatus));
        // setHasEndedTimer(false); // gameStatus가 변경되면 타이머 종료 상태 초기화
    }, [gameStatus]);

    // 타이머가 0이 되면 종료 처리
    useEffect(() => {
        if (time <= 0) {
            onTimerEnd();
        }
    }, [time]);

    return (
        <div className="timer">
            <div className="stage-image">
                <img src={stages[stageIndex].image} alt={stages[stageIndex].name} />
            </div>
            <div className="time-display">
                {gameStatus === "DAY" && canModifyTime && (
                    <>
                        <button
                            className="decrease-time"
                            onClick={() => onModifyTime(-15)}
                            aria-label="Decrease Time"
                        >-</button>
                    </>
                )}
                <span>
                    {`${Math.floor((time || 0) / 60)}:${((time || 0) % 60).toString().padStart(2, '0')}`}
                </span>
                {gameStatus === "DAY" && canModifyTime && (
                    <>
                        <button
                            className="increase-time"
                            onClick={() => onModifyTime(15)}
                            aria-label="Increase Time"
                        >+</button>
                    </>
                )}
            </div>
            <div className="stage-info">
                {dayCount}일차 {stages[stageIndex].name}
            </div>
        </div>
    );
};

export default Timer;