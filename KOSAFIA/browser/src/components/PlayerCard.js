import React from 'react';
import '../styles/components/PlayerCard.css';

const PlayerCard = ({ name }) => {
    return (
        <div className="player-card">
            <div className="player-avatar" />
            <div className="player-name">{name}</div>
        </div>
    );
};

export default PlayerCard;
