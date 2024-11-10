import React from "react";
import PropTypes from "prop-types";
import "../styles/components/NightActionPopup.css";

const NightActionPopup = ({ message, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>밤 시간 결과</h2>
        <p>{message}</p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

NightActionPopup.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NightActionPopup;
