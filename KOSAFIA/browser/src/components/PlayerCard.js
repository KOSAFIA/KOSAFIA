import React, { useState, useEffect } from "react";
import JobInteraction from "./JobInteraction";
import "../styles/components/PlayerCard.css";
import "bootstrap/dist/css/bootstrap.min.css";

// 역할 정보 배열
const roles = [
  { name: "MAFIA", image: "/img/mafia.jpeg" },
  { name: "DOCTOR", image: "/img/doctor.jpeg" },
  { name: "POLICE", image: "/img/police.jpeg" },
  { name: "CITIZEN", image: "/img/citizen.png" },
];

const PlayerCard = ({
  name,
  index,
  role,
  isNight,
  currentPlayerRole,
  currentPlayerNum,
  onTargetChange, // 타겟 선택 업데이트 함수
}) => {
  const [isRoleMemoOpen, setIsRoleMemoOpen] = useState(false);
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);
  const [avatar, setAvatar] = useState("/img/default-avatar.png");
  const [target, setTarget] = useState(null);

  // 역할에 따른 아바타 설정
  useEffect(() => {
    if (role && index === 0) {
      const selectedRole = roles.find((r) => r.name === role);
      if (selectedRole) setAvatar(selectedRole.image);
    } else {
      setAvatar("/img/default-avatar.png");
    }
  }, [role, index]);

  // 밤이 되면 자동으로 JobInteraction 팝업 열기
  useEffect(() => {
    if (isNight && currentPlayerRole !== "CITIZEN") {
      console.log("Night라네요");
      setIsInteractionOpen(true);
    }

    if (!isNight) {
      setIsInteractionOpen(false);
    }
  }, [isNight, currentPlayerRole]);

  // 역할 메모 창 열기
  const handleRoleMemoOpen = () => setIsRoleMemoOpen(true);

  // 타겟 선택
  const handleTargetSelect = (targetPlayerNumber) => {
    console.log("handleTargetSelect 실행");
    setTarget(targetPlayerNumber);
    onTargetChange(currentPlayerNum, targetPlayerNumber); // 타겟 선택 즉시 부모 컴포넌트로 업데이트
  };

  const handleClose = () => {
    setIsRoleMemoOpen(false);
    setIsInteractionOpen(false);
  };

  return (
    <div>
      <div
        className="player-card"
        onClick={handleRoleMemoOpen}
        data-index={index + 1}
      >
        <div
          className="player-avatar"
          style={{ backgroundImage: `url(${avatar})` }}
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

      {/* 역할 수행 팝업 */}
      {isInteractionOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2> 타겟 선택</h2>
            <JobInteraction onSelect={handleTargetSelect} />
            <div className="button-wrapper">
              <div className="circle">
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setIsInteractionOpen(false)}
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
