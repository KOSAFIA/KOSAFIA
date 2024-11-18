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
  //김남영 따로 추가 게임스테이터스 소켓 변수 이건 안추가 할수가 없네요요
  gameStatus,
  voteStatus, // 추가: 투표 현황
  onClick // 수정: 투표 처리를 위한 click handler
}) => {
  const [isRoleMemoOpen, setIsRoleMemoOpen] = useState(false);
  const [avatar, setAvatar] = useState("/img/default-avatar.png");
  const [target, setTarget] = useState(null);
  const cardRef = useRef(null);

  // 역할에 따른 아바타 설정
  useEffect(() => {
    // 각 플레이어의 역할에 맞는 이미지 설정
    if (role) {
      const selectedRole = roles.find((r) => r.name === role);
      if (selectedRole) {
        setAvatar(selectedRole.image); // 해당 역할에 맞는 이미지를 설정
      } else {
        setAvatar("/img/default-avatar.png"); // 역할이 없으면 기본 이미지 설정
      }
    }
  }, [role]); // role이 바뀔 때마다 실행

  // 밤이 되면 자동으로 타겟 초기화
  useEffect(() => {
    if (!isNight) {
      setTarget(null); // 밤이 아니면 타겟 초기화
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
    if (isNight && currentPlayerRole !== "CITIZEN" && isAlive) {
      handleTargetSelect(index + 1); // 클릭된 카드의 플레이어 번호를 타겟으로 설정
    }
    //밤로직은 하은님. 그외 로직은 밑에거
    // 투표 로직
    if (gameStatus === "VOTE" && isAlive) {
      onClick && onClick(); // GameRoom의 handlePlayerSelect 호출
    } else {
      handleCardClickOthers(gameStatus);
    }
  };

  //====김남영 추가 블록 손코=====
  const handleCardClickOthers = (gameSatus) => {

    switch(gameStatus){
      case "NIGHT":
        //하은님 코드만 돌아가게하고 끝
        break;
      case "DELAY":
        //클릭 자체가 암것도 안해
        break;
      case "DAY":
        //메모창 열기??
        handleRoleMemoOpen();
        break;
      case "VOTE":
        if (isAlive) {
          handleTargetSelect(index + 1); // 클릭된 카드의 플레이어 번호를 타겟으로 설정
        }
        break;
      case "FINALVOTE" :
        //아직 미구현현
        break;
      default:
        //일단 막아
        break;
    }
  }
  // 투표 카운트 표시 컴포넌트
  const VoteCount = () => {
    if (gameStatus !== "VOTE" || !voteStatus) return null;

    const count = voteStatus[index + 1] || 0;
    return (
      <div className="vote-count">
        <span>{count} 표</span>
      </div>
    );
  };
  //==============================

  const handleClose = () => {
    setIsRoleMemoOpen(false);
  };

  return (
    <div>
      <div
        className={`player-card ${
          ((isNight && currentPlayerRole !== "CITIZEN") || gameStatus === "VOTE") && isAlive
            ? "clickable"
            : ""
        }`}
        ref={cardRef}
        onClick={handleCardClick}
        data-index={index + 1}
      >
        <div
          className="player-avatar"
          style={{ backgroundImage: `url(${avatar})` }} // 동적으로 아바타 이미지 설정
        />
        <div className="player-name">{name}</div>
        <VoteCount />

        {/* 김남영 추가 투표용 라디오 버튼*/}
        <div className="player-card-radio-container">
        </div>
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
