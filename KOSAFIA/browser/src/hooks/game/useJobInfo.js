import { useState, useEffect } from "react";

const useJobInfo = (players) => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (players && players.length > 0) {
      const playerJobs = players.map((player) => ({
        playerNumber: player.playerNumber,
        username: player.username || `Player ${player.playerNumber}`,
        role: player.role,
        isAlive: player.isAlive ?? true,
        isVoteTarget: player.isVoteTarget ?? false
      }));
      setJobs(playerJobs);
    }
  }, [players]);

  return jobs;
};

export default useJobInfo;
