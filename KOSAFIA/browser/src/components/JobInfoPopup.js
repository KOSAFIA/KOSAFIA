import React from "react";
import "../styles/components/JobInfoPopup.css";

const JobInfoPopup = ({ role }) => {
  return (
    <div className="job-info-popup">
      <h2>직업 설명</h2>
      {role ? (
        <>
          <h3>{role.title}</h3>
          <p>{role.description}</p>
        </>
      ) : (
        <p>잘못된 직업 정보입니다.</p>
      )}
    </div>
  );
};

export default JobInfoPopup;
