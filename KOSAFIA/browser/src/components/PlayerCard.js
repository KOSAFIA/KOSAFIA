import React, { useState, useEffect } from "react";
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
  isSelected,
  isNight,
  onTargetSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [avatar, setAvatar] = useState("/img/default-avatar.png"); // 기본 아바타

  useEffect(() => {
    // 첫 번째 플레이어만 해당 역할에 맞는 아바타를 설정
    if (role && index === 0) {
      const selectedRole = roles.find((r) => r.name === role); // 역할 이름에 맞는 이미지 찾기
      if (selectedRole) {
        setAvatar(selectedRole.image); // 이미지 설정
      }
    } else {
      setAvatar("/img/default-avatar.png"); // 기본 아바타 설정
    }
  }, [role, index]); // 역할이나 index가 변경될 때마다 실행

  // const handleCardClick = () => {
  //   // 시민이 아닌 경우만 타겟을 선택할 수 있음 (아마 여기가 문제여서 생기는 일)
  //   if (isNight && role !== "CITIZEN" && role !== "NONE") {
  //     onTargetSelect(index + 1); // 타겟 선택
  //   }
  // };

  const handlePopupOpen = () => {
    setIsOpen(true); // 팝업을 열도록 설정
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleRoleSelect = (selectedRole) => {
    setAvatar(selectedRole.image); // 선택한 역할의 이미지를 avatar에 설정
  };

  return (
    <div>
      <div
        className={`player-card ${isSelected ? "selected" : ""}`}
        onClick={handlePopupOpen} 
        data-index={index + 1}
      >
        <div
          className="player-avatar"
          style={{ backgroundImage: `url(${avatar})` }}
        />
        <div className="player-name">{name}</div>
      </div>

      {isOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>{name}의 역할 메모</h2>
            <div className="role-selection">
              {roles.map((role, i) => (
                <div
                  key={i}
                  className="role-option"
                  onClick={() => handleRoleSelect(role)}
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
