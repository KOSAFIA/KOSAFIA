// JobInteraction.js
export async function mafiaSelectTarget(players, targetNumber) {
    const response = await fetch("/api/game/mafiaSelectTarget?targetNumber=" + targetNumber, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(players),
    });
    return response.json();
}

export { fetchPlayers };

export async function doctorSavePlayer(players, saveTargetNumber) {
    const response = await fetch("/api/game/doctorSavePlayer?saveTargetNumber=" + saveTargetNumber, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(players),
    });
    return response.json();
}

export async function policeCheckRole(players, checkTargetNumber) {
    const response = await fetch("/api/game/policeCheckRole?checkTargetNumber=" + checkTargetNumber, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(players),
    });
    return response.json();
}

export async function nightActionResult(players) {
    const response = await fetch("/api/game/nightActionResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(players),
    });
    return response.json();
}

// players 데이터를 가져오는 함수 (임시용)
async function fetchPlayers() {
    const response = await fetch("/api/game/players");
    const data = await response.json();
    return data;
}