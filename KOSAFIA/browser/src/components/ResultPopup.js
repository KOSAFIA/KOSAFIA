// ResultPopup.js
import React, { useEffect, useState } from "react";
import "../styles/components/ResultPopup.css";

const ResultPopup = ({ imageUrl }) => {
  const [showPopup, setShowPopup] = useState(false);
  console.log("ResultPopup 컴포넌트 렌더링 시작");
  console.log("받은 이미지 URL:", imageUrl);
  console.log("현재 showPopup 상태:", showPopup);

  useEffect(() => {
    if (imageUrl) {
      console.log("이미지 URL이 존재하여 팝업 표시 시작");
      setShowPopup(true);

      const timer = setTimeout(() => {
        console.log("5초 타이머 종료, 팝업 닫기");
        setShowPopup(false);
      }, 5000);

      return () => {
        console.log("타이머 클리어");
        clearTimeout(timer);
      };
    }
  }, [imageUrl]);

  if (!imageUrl || !showPopup) {
    console.log("조건 불충족으로 렌더링 중단", { imageUrl, showPopup });
    return null;
  }

  return (
    <div className="Resultpopup-container">
      <div className="Resultpopup-content">
        <img
          src={imageUrl}
          alt="Game result"
          className="Resultpopup-image"
          onLoad={(e) => {
            console.log("이미지 로드 성공:", {
              url: imageUrl,
              width: e.target.naturalWidth,
              height: e.target.naturalHeight,
            });
          }}
          onError={(e) => {
            console.error("이미지 로드 실패:", {
              url: imageUrl,
              error: e.error,
            });
          }}
        />
      </div>
    </div>
  );
};

export default ResultPopup;
