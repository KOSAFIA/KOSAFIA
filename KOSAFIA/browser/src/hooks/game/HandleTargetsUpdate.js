// 타겟 업데이트 함수
const handleTargetsUpdate = async (playerNumber, target) => {
  try {
    const response = await fetch("/api/game/update-targets-at-night", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerNumber: playerNumber,
        target: target,
      }), // 개별 Player의 데이터 전송
    });

    if (!response.ok) {
      throw new Error("타겟 업데이트 실패");
    }

    const result = await response.json();
    console.log(`Player ${playerNumber}의 타겟 업데이트 완료:`, result);
  } catch (error) {
    console.error("타겟 업데이트 실패:", error);
  }
};

export default handleTargetsUpdate;
