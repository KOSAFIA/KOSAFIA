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
    console.log(currentPlayerNum + "이 " + targetPlayerNumber + "을 클릭했음.");
  };

  // 카드 클릭시 타겟 선택
  const handleCardClick = () => {
    if (isNight && currentPlayerRole !== "CITIZEN" && isAlive) {
      handleTargetSelect(index + 1); // 클릭된 카드의 플레이어 번호를 타겟으로 설정
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
