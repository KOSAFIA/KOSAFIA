import { useState, useEffect, useRef } from "react";

const useJobInfo = (playerNames) => {
  const [job, setJob] = useState(null);
  // 요청이 발생했는지 추적 -> 한 번만 실행되도록 하려는 목적
  const hasFetched = useRef(false); 

  useEffect(() => {
    const fetchJobInfo = async () => {
      try {
        console.log("요청 보내기 전에 메서드 확인: GET");

        const response = await fetch(
          `/api/game/getRoles?name=${playerNames.join('&name=')}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          }
        );

        const players = await response.json();

        if (players.length > 0) {
          setJob(players[0]?.role); // 첫 번째 플레이어의 역할 설정
        }
      } catch (error) {
        console.error("역할 정보를 가져오는 중 오류 발생:", error);
      }
    };

    if (playerNames && playerNames.length > 0 && !hasFetched.current) {
      fetchJobInfo(); // 요청 전송
      hasFetched.current = true; // 요청이 이미 발생했음을 설정
    }
  }, [playerNames]); // playerNames가 변경될 때 실행

  return job;
};

export default useJobInfo;
