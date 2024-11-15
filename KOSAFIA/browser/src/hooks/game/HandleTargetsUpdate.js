const handleTargetsUpdate = (playerNum, target) => {
  console.log(`${playerNum}가 ${target}를 선택했습니다.`);
  updatePlayerTargetsAtNight(playerNum, target);
};

const updatePlayerTargetsAtNight = async (playerNum, target) => {
  try {
    const requestBody = JSON.stringify([
      {
        playerNumber: Number(playerNum),
        target: target,
      },
    ]);
    console.log("Sending request body:", requestBody);
    const response = await fetch("/api/game/update-targets-at-night", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error("서버와의 통신에 실패했습니다.");
    }

    const result = await response.json();
    console.log("타겟 업데이트 성공:", result);
  } catch (error) {
    console.error("타겟 업데이트 실패:", error);
  }
};

export default handleTargetsUpdate;
