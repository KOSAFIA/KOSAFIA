import { useState, useEffect } from "react";

const useJobInfo = (playerNames) => {
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJobInfo = async () => {
      try {
        const response = await fetch("/api/game/getRoles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(playerNames.map(name => ({ name }))),
        });

        const textResponse = await response.text();
        console.log("응답 원문:", textResponse);

        // 응답 JSON.parse해서 플레이어 목록 얻기
        const players = JSON.parse(textResponse);  
        console.log("파싱된 플레이어 데이터:", players);

        if (players.length > 0) {
          setJob(players[0]?.role);
        }
      } catch (error) {
        console.error("역할 정보를 가져오는 중 오류 발생:", error);
      }
    };

    if (playerNames && playerNames.length > 0) {
      fetchJobInfo();   // /api/game/getRoles 엔드포인트에 POST 요청
    }
  }, []); // 한번만 실행되도록 빈 배열을 의존성 배열로 설정

  return job;
};

export default useJobInfo;
