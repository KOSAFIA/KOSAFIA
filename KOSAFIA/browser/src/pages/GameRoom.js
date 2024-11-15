import React, { useState, useEffect, useRef } from "react";
import PlayerCard from "../components/PlayerCard";
import Timer from "../components/Timer";
import DayIndicator from "../components/DayIndicator";
import ChatBox from "../components/ChatBox";
import Popup from "../components/JobExpectationPopUp";
import JobInfoIcon from "../components/JobInfoIcon";
import useJobInfo from "../hooks/game/useJobInfo";
import handleTargetsUpdate from "../hooks/game/HandleTargetsUpdate";
import handleNightActions from "../hooks/game/HandleNightAction";
import "../styles/GameRoom.css";

const GameRoom = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [players, setPlayers] = useState([]);
  const chatBoxRef = useRef();
  const [playerNumbers, setPlayerNumbers] = useState([]);
  const [targetSelection, setTargetSelection] = useState({}); // 각 플레이어가 선택한 타겟을 저장

  useEffect(() => {
    setPlayerNumbers([1, 2, 3, 4, 5, 6, 7, 8]);
  }, []);

  // 게임 시작 시 플레이어 목록을 서버에서 가져옴 (임의 수정 필요)
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("/api/game/players");
        if (!response.ok) {
          throw new Error("플레이어 목록을 가져오는 데 실패했습니다.");
        }
        const playersData = await response.json();
        setPlayers(playersData); // 서버에서 받은 플레이어 목록 상태에 저장
      } catch (error) {
        console.error("플레이어 목록 가져오기 실패:", error);
      }
    };

    fetchPlayers();
  }, []);

  const PlayerInfo = useJobInfo(playerNumbers);

  const sendMessageToChat = (message) => {
    chatBoxRef.current?.receiveMessage(message);
  };

  const handleOpenPopup = (playerName) => {
    setSelectedPlayer(playerName);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedPlayer(null);
  };

  // 단계가 변경될 때 호출되는 함수
  const handleStageChange = (newStageIndex) => {
    setStageIndex(newStageIndex);

    // 밤 단계(4)가 끝나고 test 단계(5)로 변경될 때 타겟 업데이트 실행
    if (newStageIndex === 5) {
      // 모든 플레이어의 타겟 정보를 서버로 전송
      Object.entries(targetSelection).forEach(([playerNum, target]) => {
        handleTargetsUpdate(playerNum, target);
      });

      // 서버에 요청을 보내서 밤 단계의 행동을 처리
      handleNightActions(players); // players를 전달
    }
  };

  // 타겟 변경을 처리하는 함수
  const handleTargetChange = (playerNumber, targetPlayerNumber) => {
    setTargetSelection((prev) => ({
      ...prev,
      [playerNumber]: targetPlayerNumber,
    }));
    // 타겟 정보는 밤 단계가 끝난 후 한 번에 서버로 전송하므로 여기서는 서버로 전송하지 않음
  };

  return (
    <div className={`game-room ${stageIndex === 1 ? "shadow-inset-top" : ""}`}>
      <div className="chat-area">
        <div className="player-area">
          <div className="header">
            {PlayerInfo.length > 0 && (
              <Timer
                onStageChange={handleStageChange}
                onSendMessage={sendMessageToChat}
                playerNumber={PlayerInfo[0].playerNumber}
                role={PlayerInfo[0].role}
              />
            )}
            <DayIndicator currentPhase={stageIndex === 1 ? "밤" : "낮"} />
          </div>
          {PlayerInfo.length > 0 && <JobInfoIcon role={PlayerInfo[0].role} />}
          <div className="player-cards">
            {PlayerInfo.map((player, index) => (
              <PlayerCard
                key={player.playerNumber}
                name={`Player ${player.playerNumber}`}
                index={player.playerNumber - 1}
                role={player.role}
                isNight={stageIndex === 4}
                currentPlayerNum={PlayerInfo[0].playerNumber}
                onTargetChange={handleTargetChange}
                onClick={() => {
                  const playerName = `Player ${player.playerNumber} (${player.role})`;
                  handleOpenPopup(playerName);
                }}
              />
            ))}
          </div>
        </div>
        <ChatBox ref={chatBoxRef} stageIndex={stageIndex} />
      </div>
      {isPopupOpen && (
        <Popup onClose={handleClosePopup} selectedPlayer={selectedPlayer} />
      )}
    </div>
  );
};

export default GameRoom;
