  import React from "react";
  import "../styles/components/JobInfoPopup.css";

  const JobInfoPopup = ({ job }) => {
    const jobInfo = {
      MAFIA: {
        title: "- 마피아",
        description: "[처형] 밤마다 한 명의 플레이어를 죽일 수 있으며 마피아끼리 대화가 가능하다."
      },
      POLICE: {
        title: "- 경찰",
        description: "[조사] 밤마다 한 사람을 조사하여 그 사람의 직업이 마피아인지 여부를 알 수 있다."
      },
      DOCTOR: {
        title: "- 의사",
        description: "[치유] 밤마다 한 사람을 지목하여 대상이 마피아에게 공격받을 경우, 대상을 치료한다."
      },
      CITIZEN: {
        title: "- 시민",
        description: "특별한 능력이 없습니다. 마피아를 찾아내세요"
      }
    };

    // job에 해당하는 정보를 jobInfo에서 찾아 currentJob으로 저장
    const currentJob = jobInfo[job];

    return (
      <div className="job-info-popup">
        <h2>직업 설명</h2>
        {currentJob ? (
          <>
            <h3>{currentJob.title}</h3>
            <p>{currentJob.description}</p>
          </>
        ) : (
          <p>잘못된 직업 정보입니다.</p>
        )}
      </div>
    );
  };

  export default JobInfoPopup;
