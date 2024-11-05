import React, { useState } from "react";
import JobInfoPopup from "./JobInfoPopup";
import "../styles/components/JobInfoIcon.css";

const JobInfoIcon = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="job-info-icon"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <i class="fa-solid fa-info"></i> 
      {/* 현재 하드코딩한 상태. 후에 바꾸기 */}
      {isHovered && <JobInfoPopup job="mafia" />}
    </div>
  );
};

export default JobInfoIcon;