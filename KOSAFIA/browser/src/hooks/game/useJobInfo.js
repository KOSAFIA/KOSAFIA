import { useState, useEffect } from "react";

const useJobInfo = (playerNumbers) => {
  const [jobs, setJobs] = useState([]); // 모든 플레이어의 역할 정보 저장

  useEffect(() => {
    const fetchJobInfo = async () => {
      try {
        const response = await fetch(
          `/api/game/getRoles?playerNumber=${playerNumbers.join("&playerNumber=")}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const players = await response.json();

        if (players.length > 0) {
          const playerJobs = players.map((player) => ({
            playerNumber: player.playerNumber,
            username: player.username,
            target : player.target,
            role: player.role,
          }));
          setJobs(playerJobs);
        }
      } catch (error) {
        console.error("역할 정보를 가져오는 중 오류 발생:", error);
      }
    };

    if (playerNumbers && playerNumbers.length > 0) {
      fetchJobInfo(); // 서버에서 역할 정보 받아오기
    }
  }, [playerNumbers]); // playerNumbers가 변경될 때마다 역할 정보 갱신

  return jobs; // 모든 플레이어의 역할 정보를 반환
};

export default useJobInfo;
