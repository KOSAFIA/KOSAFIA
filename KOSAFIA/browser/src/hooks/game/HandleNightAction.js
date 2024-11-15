const handleNightActions = async (players) => {
  try {
    const response = await fetch("/api/game/handle-night-actions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ players: players }), // players는 서버에서 처리할 플레이어 목록
    });

    if (!response.ok) {
      throw new Error("밤 단계 행동 처리에 실패했습니다.");
    }

    const result = await response.text();
    console.log("밤 단계 행동 완료:", result);
  } catch (error) {
    console.error("밤 단계 행동 처리 실패:", error);
  }
};

export default handleNightActions;
