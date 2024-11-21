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
    if (!isAlive) {
      return;
    } 

    if (isNight && currentPlayerRole !== "CITIZEN" && isAlive) {
      handleTargetSelect(index + 1); // 클릭된 카드의 플레이어 번호를 타겟으로 설정
    } else if (gameStatus === "VOTE" && isAlive) {
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
          isNight && currentPlayerRole !== "CITIZEN" && isAlive
            ? "clickable"
            : ""
        }

          ${gameStatus === "VOTE" && isAlive ? "vote-clickable" : ""}
          ${
            gameStatus === "FINALVOTE" && isAlive && isVoteTarget
              ? "final-vote-target"
              : ""
          }
          ${!isAlive ? "player-card-dead" : ""}
          ${
            selectedPlayer === `${index + 1} (${role})`
              ? "player-card-clicked"
              : ""
          }
          `}
        ref={cardRef}
        onClick={handleCardClick}
        data-index={index + 1}
      >
        <div
          className="player-avatar"
          style={{ backgroundImage: `url(${avatar})` }} // 동적으로 아바타 이미지 설정
        />
        <div className="player-name">{name}</div>
        <div className="vote-count">{voteCount} 표</div>

        {/* 최종 투표 대상자인 경우에만 찬반 투표 카운트 표시 */}
        {gameStatus === "FINALVOTE" && isVoteTarget && (
          <div className="final-vote-buttons">
            <div className="vote-buttons">
              <button
                className="agree-btn"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (true) {
                    try {
                      await onFinalVoteClick(true);
                      console.log("찬성 투표 완료");
                    } catch (error) {
                      console.error("찬성 투표 실패:", error);
                    }
                  }
                }}
              >
                찬성
              </button>
              <button
                className="disagree-btn"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (true) {
                    try {
                      await onFinalVoteClick(false);
                      console.log("반대 투표 완료");
                    } catch (error) {
                      console.error("반대 투표 실패:", error);
                    }
                  }
                }}
              >
                반대
              </button>
            </div>
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
