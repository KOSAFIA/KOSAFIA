import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Lobby.css";
import Modal from "react-modal";
import LoginOk from "../user/LoginOk";

function Lobby() {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomName: "",
    maxPlayers: 8,
    isPrivate: false,
  });

  useEffect(() => {
    // Redis에서 방 정보 가져오기
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("방 정보를 가져오는데 실패했습니다.", error);
      }
    };
    fetchRooms();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const createRoom = async () => {
    try {
      await axios.post("http://localhost:8080/api/rooms", newRoom);
      closeModal();
      // 방 생성 후 다시 방 목록 불러오기
      const response = await axios.get("http://localhost:8080/api/lobby");
      setRooms(response.data);
    } catch (error) {
      console.error("방 생성에 실패했습니다.", error);
    }
  };

  return (
    <div className="lobby-container">
      <div className="sidebar">
        <div className="profile">
          <div className="profile-pic">?</div>
          <div className="profile-info">
            <p>0</p>
            <p>1,049</p>
          </div>
        </div>
      </div>
      <div className="lobby-main">
        <div className="lobby-header">
          <button className="create-room-btn" onClick={openModal}>
            방 만들기
          </button>
          <button className="quick-join-btn">빠른 입장</button>
          <button className="exit-btn">종료</button>
        </div>
        <div className="room-list">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div key={room.roomId} className="room-item">
                <div className="room-info">
                  <span className="room-number">{room.roomId}. </span>
                  <span className="room-name">{room.roomName}</span>
                  {room.isPrivate && <span className="private-room"> 🔒</span>}
                </div>
                <div className="room-players">
                  <span className="players">
                    {room.currentPlayers}/{room.maxPlayers}
                  </span>
                  <span className="room-status"> {room.roomStatus}</span>
                </div>
                <button className="join-room-btn">입장</button>
              </div>
            ))
          ) : (
            <p>현재 대기 중인 방이 없습니다.</p>
          )}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="방 만들기"
        className="create-room-modal"
        overlayClassName="create-room-overlay"
      >
        <h2>방 만들기</h2>
        <div className="modal-content">
          <label>
            방 제목:
            <input
              type="text"
              name="roomName"
              value={newRoom.roomName}
              onChange={handleInputChange}
            />
          </label>
          <label>
            최대 인원:
            <input
              type="number"
              name="maxPlayers"
              value={newRoom.maxPlayers}
              onChange={handleInputChange}
              min="4"
              max="12"
            />
          </label>
          <label>
            비밀방:
            <input
              type="checkbox"
              name="isPrivate"
              checked={newRoom.isPrivate}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <div className="modal-buttons">
          <button onClick={createRoom} className="create-room-confirm-btn">
            생성
          </button>
          <button onClick={closeModal} className="create-room-cancel-btn">
            취소
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Lobby;
