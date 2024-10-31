import React from 'react';
import '../styles/components/JobExpectationPopUp.css';

const JobExpectationPopUp = ({ onClose, roles, onSelectRole }) => {
    return (
        <div className="popup-content">
            <h1>직업 메모</h1>
            <div className="role-selection">
                {roles.map((role, index) => (
                    <div
                        key={index}
                        className="role-option"
                        onClick={() => onSelectRole(role)}
                    >
                        <img src={role.image} alt={role.name} />
                        <div className="role-name">{role.name}</div>
                    </div>
                ))}
            </div>
            <div className="button-container">
                <button onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default JobExpectationPopUp;
