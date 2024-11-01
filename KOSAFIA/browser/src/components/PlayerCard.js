import React, { useState } from 'react';
import '../styles/components/PlayerCard.css';

const roles = [
    { name : '마피아', image : '/img/mafia.jpeg'},
    { name : '의사', image : '/img/doctor.jpeg'},
    { name : '경찰', image : '/img/police.jpeg'},
    { name : '시민', image : '/img/citizen.png'},
];

const PlayerCard = ({ name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [avatar, setAvatar] = useState('/img/default-avatar.png'); // 기본 아바타 경로

    const handleCardClick = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleRoleSelect = (role) => {
        setAvatar(role.image); // 선택한 역할의 이미지를 아바타로 설정
        setIsOpen(false); // 팝업 닫기
    };

    return (
        <div>
            <div className="player-card" onClick={handleCardClick}>
                <div className="player-avatar" style={{ backgroundImage: `url(${avatar})` }} />
                <div className="player-name">{name}</div>
            </div>

            {isOpen && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>{name}의 역할 메모</h2>
                        <div className="role-selection">
                            {roles.map((role, index) => (
                                <div
                                    key={index}
                                    className="role-option"
                                    onClick={() => handleRoleSelect(role)}
                                    style={{ backgroundImage: `url(${role.image})`, backgroundSize: 'cover' }} // 이미지 배경 설정
                                >
                                    <span>{role.name}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleClose}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerCard;
