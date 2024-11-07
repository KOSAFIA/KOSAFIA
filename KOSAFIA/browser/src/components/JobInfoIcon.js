import React, { useState } from "react";
import JobInfoPopup from "./JobInfoPopup";
import "../styles/components/JobInfoIcon.css";
import useJobInfo from "../hooks/game/useJobInfo";

const JobInfoIcon = () => {
  const [isHovered, setIsHovered] = useState(false);

  // 하드코딩된 플레이어 이름 배열 (후에 수정하기)
  const playerNames = [
    "Player1",
    "Player2",
    "Player3",
    "Player4",
    "Player5",
    "Player6",
    "Player7",
    "Player8",
  ];

  const job = useJobInfo(playerNames);

  return (
    <div
      className="job-info-icon"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <i className="fa-solid fa-info"></i>
      {isHovered && job && <JobInfoPopup job={job} />}
    </div>
  );
};

export default JobInfoIcon;
