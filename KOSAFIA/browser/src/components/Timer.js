import React, { useState, useEffect, useRef } from "react";
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
    const [currentTime, setCurrentTime] = useState(time);
    const timerRef = useRef(null);

    // gameStatus 변경 시 초기화
    useEffect(() => {
        setStageIndex(stages.findIndex(stage => stage.name === gameStatus));
        setCurrentTime(time); // 서버에서 받은 시간으로 초기화
    }, [gameStatus, time]);

    // 타이머 로직
    useEffect(() => {
        if (currentTime === undefined || currentTime === null) return;

        // 이전 타이머 정리
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // 새로운 타이머 시작
        if (currentTime > 0) {
            timerRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        onTimerEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (currentTime <= 0) {
            onTimerEnd();
        }

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [currentTime, onTimerEnd]);

    // 서버 시간 동기화
    useEffect(() => {
        if (Math.abs(time - currentTime) > 2) { // 2초 이상 차이나면 동기화
            setCurrentTime(time);
        }
    }, [time]);

    const formatTime = (timeValue) => {
        if (timeValue === null || timeValue === undefined) return "0:00";
        const minutes = Math.floor(timeValue / 60);
        const seconds = timeValue % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="timer">
            <div className="stage-image">
                <img src={stages[stageIndex]?.image || stages[0].image} alt={stages[stageIndex]?.name || "Loading"} />
            </div>
            <div className="time-display">
                {gameStatus === "DAY" && canModifyTime && (
                    <button
                        className="decrease-time"
                        onClick={() => onModifyTime(-15)}
                        aria-label="Decrease Time"
                    >-</button>
                )}
                <span>{formatTime(currentTime)}</span>
                {gameStatus === "DAY" && canModifyTime && (
                    <button
                        className="increase-time"
                        onClick={() => onModifyTime(15)}
                        aria-label="Increase Time"
                    >+</button>
                )}
            </div>
            <div className="stage-info">
                {dayCount}일차 {stages[stageIndex]?.name || "Loading"}
            </div>
        </div>
    );
};

export default Timer;