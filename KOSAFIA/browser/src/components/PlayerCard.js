import React, { useState, useEffect, useRef } from "react";
import "../styles/components/PlayerCard.css";
import "../styles/components/JobExpectationPopUp.css";
import "bootstrap/dist/css/bootstrap.min.css";

// 역할 정보 배열
const roles = [
  { name: "MAFIA", image: "/img/mafia-ingame.jpeg" },
  { name: "DOCTOR", image: "/img/doctor-ingame.png" },
  { name: "POLICE", image: "/img/police-ingame.png" },
  { name: "CITIZEN", image: "/img/citizen.png" },
];

const PlayerCard = ({
  name,
  index,
  role, // 각 플레이어의 역할
  isNight,
  currentPlayerRole, // 현재 플레이어의 역할
  currentPlayerNum,
  onTargetChange, // 타겟 선택 업데이트 함수
  isAlive,
  currentPlayer,
  onClick,
  gameStatus,
  voteCount = 0,
  isVoteTarget = false, // 최종 투표 대상자 여부 prop 추가
  onFinalVoteClick,
  selectedPlayer, // 부모 컴포넌트에서 전달받은 selectedPlayer
  setSelectedPlayer, // 부모 컴포넌트에서 전달받은 setSelectedPlayer
  canFinalVote = false,
  voteStatus,
  finalVotes,
  myVoteTarget,
}) => {
  const [isRoleMemoOpen, setIsRoleMemoOpen] = useState(false);
  const [avatar, setAvatar] = useState("/img/default-avatar.png");
  const [target, setTarget] = useState(null);
  const cardRef = useRef(null);

  // 역할에 따른 아바타 설정
  useEffect(() => {
    // 현재 플레이어일 경우에만 역할 이미지를 표시
    if (currentPlayerNum === index + 1) {
      const selectedRole = roles.find((r) => r.name === role);
      if (selectedRole) {
        setAvatar(selectedRole.image); // 자신의 역할 이미지 설정
      }
    } else {
      setAvatar("/img/default-avatar.png"); // 다른 플레이어는 기본 이미지 표시
    }
  }, [role, currentPlayerNum, index]);

  // 밤이 되면 자동으로 타겟 초기화
  useEffect(() => {
    if (!isNight) {
      setTarget(null); // 밤이 아니면 타겟 초기화
      setSelectedPlayer(null); // 밤 시간이 아니면 선택된 플레이어 초기화
    }
  }, [isNight]);

  // 죽은 경우(isAlive = false) playercard에 이팩트 추가
  useEffect(() => {
    const cardElement = cardRef.current;
    if (!isAlive) {
      cardElement.classList.add("player-card-dead");
      cardElement.classList.remove("player-card-clicked");
    } else {
      cardElement.classList.remove("player-card-dead");
    }
  }, [isAlive]);


  // 역할 메모 창 열기
  const handleRoleMemoOpen = () => setIsRoleMemoOpen(true);

  // 타겟 선택
  const handleTargetSelect = (targetPlayerNumber) => {
    setTarget(targetPlayerNumber);
    onTargetChange(currentPlayerNum, targetPlayerNumber); // 타겟 선택 즉시 부모 컴포넌트로 업데이트
  };

  // 카드 클릭시 타겟 선택
  const handleCardClick = () => {
    if (!currentPlayer.isAlive) {
      return;
    }

    if (isNight && currentPlayerRole !== "CITIZEN" && currentPlayer.isAlive) {
      handleTargetSelect(index + 1); // 클릭된 카드의 플레이어 번호를 타겟으로 설정
    } else if (gameStatus === "VOTE" && currentPlayer.isAlive) {
      onClick?.();
    } else {
      handleRoleMemoOpen(); // 조건이 만족되지 않을 경우 역할 메모 열기
    }

    // 선택된 플레이어의 상태를 관리하여 클릭된 카드만 선택 상태로 변경
    const playerName = `${index + 1} (${role})`;
    if (selectedPlayer === playerName) {
      // 이미 선택된 카드라면, 선택 해제
      setSelectedPlayer(null);
    } else {
      // 새로운 카드 선택 시, 이전 선택 해제하고 새로 선택
      setSelectedPlayer(playerName);
    }
  };

  const handleClose = () => {
    setIsRoleMemoOpen(false);
  };

  return (
    <div>
      <div
        className={`player-card ${
          // 기본 상태
          !isAlive ? "player-card-dead" : ""} ${
          // NIGHT 상태
          isNight && currentPlayerRole !== "CITIZEN" && isAlive ? "clickable" : ""} ${
          // VOTE 상태
          gameStatus === "VOTE" 
            ? isAlive && currentPlayerNum !== index + 1 
              ? "vote-clickable" 
              : "" 
            : ""} ${
          // FINALVOTE 상태
          gameStatus === "FINALVOTE"
            ? isAlive && isVoteTarget
              ? "final-vote-target"
              : ""
            : ""
        } ${
          // 투표 상태에서만 voted-by-me 클래스 적용
          gameStatus === "VOTE" && voteStatus[currentPlayerNum] === index + 1
            ? "voted-by-me"
            : ""
        }
          ${
            isNight && isAlive && selectedPlayer === `${index + 1} (${role})`
              ? "player-card-clicked"
              : ""
          }
        `}
        ref={cardRef}
        onClick={handleCardClick}
        data-index={index + 1}
      >
        {/* 득표 수 표시 - gameStatus가 VOTE일 때만 표시 */}
        {gameStatus === "VOTE" && voteCount > 0 && (
          <div className="vote-count">
            {voteCount}
          </div>
        )}

        <div
          className="player-avatar"
          style={{ backgroundImage: `url(${avatar})` }}
        />
        <div className="player-name">{name}</div>
        
        {/* 투표 버튼 */}
        {gameStatus === "VOTE" && isAlive && currentPlayerNum !== index + 1 && (
          <button 
            className={`vote-button ${myVoteTarget === index + 1 ? 'voted' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            {myVoteTarget === index + 1 ? '✓' : '투표하기'}
          </button>
        )}

        {/* 득표 수 표시 */}
        {gameStatus === "VOTE" && voteStatus[index + 1] > 0 && (
          <div className="vote-count">
            {voteStatus[index + 1]}
          </div>
        )}

        {/* 찬반 투표 버튼 */}
        {gameStatus === "FINALVOTE" && isAlive && isVoteTarget && (
          <div className="final-vote-buttons">
            <button 
              className={`agree-btn ${finalVotes[currentPlayerNum] === true ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onFinalVoteClick?.(true);
              }}
            >
              찬성
            </button>
            <button 
              className={`disagree-btn ${finalVotes[currentPlayerNum] === false ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onFinalVoteClick?.(false);
              }}
            >
              반대
            </button>
          </div>
        )}
      </div>

      {/* 역할 메모 팝업 */}
      {isRoleMemoOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>{name}의 역할 메모</h2>
            <div className="role-selection">
              {roles.map((role, i) => (
                <div
                  key={i}
                  className="role-option"
                  onClick={() => setAvatar(role.image)}
                  style={{
                    backgroundImage: `url(${role.image})`,
                    backgroundSize: "cover",
                  }}
                >
                  <span>{role.name}</span>
                </div>
              ))}
            </div>
            <div className="button-wrapper">
              <div className="circle">
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleClose}
                ></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
