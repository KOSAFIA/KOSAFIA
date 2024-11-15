// 시간이 증가 또는 감소하는 함수
export const changeTime = (currentTime, adjustment) => {
  return Math.max(currentTime + adjustment, 0);
};

// 시간 변경을 한 번만 할 수 있도록 제한하는 함수
export const canModifyTime = (hasModified) => {
  if (hasModified) {
    alert("시간 증가 & 감소는 한 번만 가능합니다.");
    return false;
  }
  return true;
};