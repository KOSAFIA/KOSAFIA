import React from 'react';
import '../styles/components/DayIndicator.css';

const DayIndicator = ({ dayCount, currentStage }) => {
  return (
    <div className="day-indicator">
      <div className="day-info">
        {dayCount} {currentStage}
      </div>
    </div>
  );
};

export default DayIndicator;
