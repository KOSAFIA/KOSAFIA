import React from "react";
import "../styles/components/PlayerCard.css";
import "../styles/components/JobInteraction.css";

const JobInteraction = ({ onSelect }) => {
  return (
    <div className="role-selection-two">
      {/* 1~8번 플레이어 선택 버튼 -> 하드코딩되어있는 상태. 후에 수정 필요 (ex : 죽으면 선택지에서 사라진다던가 로직도 필요할지도)*/}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((target) => (
        <div key={target}>
          <button className="player-button" onClick={() => onSelect(target)}>
            Player {target}
          </button>
        </div>
      ))}
    </div>
  );
};

export default JobInteraction;
