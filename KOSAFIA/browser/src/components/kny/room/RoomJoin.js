// components/RoomJoin/RoomJoin.js
import React, { useState } from 'react';
import axios from 'axios';

const RoomJoin = ({ onJoinSuccess }) => {
    const [roomId, setRoomId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!roomId.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const userId = sessionStorage.getItem('userId'); // 현재 로그인한 사용자 ID
            
            const response = await axios.post(`/api/rooms/${roomId}/join`, null, {
                params: { userId }
            });

            if (response.data) {
                onJoinSuccess(roomId);
            }
        } catch (err) {
            setError('방 입장에 실패했습니다. ' + (err.response?.data?.error || ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="join-container">
            <form onSubmit={handleJoin}>
                <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="방 번호를 입력하세요"
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    disabled={loading || !roomId.trim()}
                >
                    {loading ? '입장 중...' : '입장하기'}
                </button>
            </form>
            {error && <p className="error-message">{error}</p>}

            <style jsx>{`
                .join-container {
                    padding: 20px;
                    max-width: 300px;
                }

                form {
                    display: flex;
                    gap: 10px;
                }

                input {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                button {
                    padding: 8px 16px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }

                .error-message {
                    color: red;
                    margin-top: 10px;
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
};

export default RoomJoin;