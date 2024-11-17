import React, { useEffect } from "react";
import "../styles/components/FirstJobExplainPopup.css";

const FirstJobExplainpopUp = ({ currentPlayerRole, onClose }) => {
  // 역할에 따른 이미지와 설명 매핑
  const roleInfo = {
    MAFIA: {
      imageUrl: "/img/mafia.png",
      description:
        "[처형] 밤마다 한 명의 플레이어를 죽일 수 있으며 마피아끼리 대화가 가능하다.",
    },
    POLICE: {
      imageUrl: "/img/police.png",
      description:
        "[조사] 밤마다 한 사람을 조사하여 그 사람의 직업이 마피아인지 여부를 알 수 있다.",
    },
    DOCTOR: {
      imageUrl: "/img/doctor.png",
      description:
        "[치유] 밤마다 한 사람을 지목하여 대상이 마피아에게 공격받을 경우, 대상을 치료한다.",
    },
    CITIZEN: {
      imageUrl: "/img/citizen.png",
      description: "특별한 능력이 없습니다. 마피아를 찾아내세요.",
    },
  };

  // 현재 플레이어의 역할 정보 가져오기
  const { imageUrl, description } = roleInfo[currentPlayerRole] || {};

  // 5초 후 팝업창 자동 닫힘 (5000인데 test용)
  useEffect(() => {
    const timer = setTimeout(onClose, 500000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="FirstJobExplainpopUp-backdrop" onClick={onClose}>
      <div className="FirstJobExplainpopUp-container">
        <img
          src={imageUrl}
          alt={currentPlayerRole}
          className="FirstJobExplainpopUp-image"
        />
        <h2> {currentPlayerRole} </h2>
        <div className="FirstJobExplainpopUp-description">{description}</div>
        <div className="FirstJobExplainpopUp-close-button" onClick={onClose}>
          닫기
        </div>
      </div>
    </div>
  );
};

export default FirstJobExplainpopUp;
