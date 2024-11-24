// ResultPopup.js
import React, { useEffect, useState } from "react";
import "../styles/components/ResultPopup.css";

const ResultPopup = ({ imageUrl }) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (imageUrl) {
      setShowPopup(true);

      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [imageUrl]);

  if (!imageUrl || !showPopup) return null;

  return (
    <div className="Resultpopup-container">
      <div className="Resultpopup-content">
        <img src={imageUrl} alt="Game result" className="Resultpopup-image" />
      </div>
    </div>
  );
};

export default ResultPopup;
