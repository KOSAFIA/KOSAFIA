import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TestRoom({ roomId }) {
    const [roomDetails, setRoomDetails] = useState(null);

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/rooms/${roomId}`);
                setRoomDetails(response.data);
            } catch (error) {
                console.error('Error fetching room details:', error);
            }
        };

        fetchRoomDetails();
    }, [roomId]);

    if (!roomDetails) {
        return <div>Loading room details...</div>;
    }

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Game Room: {roomDetails.roomId}</h1>
            <h2>Players:</h2>
            <ul>
                {roomDetails.players.map((player) => (
                    <li key={player.id}>{player.username}</li>
                ))}
            </ul>
        </div>
    );
}

export default TestRoom;