import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './TestLobby.css';
import Modal from 'react-modal';

const TestLobby = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]); // 필터링된 방 리스트
  const [roomDetails, setRoomDetails] = useState({
    roomName: "",
    maxPlayers: 8,
    isPrivate: false,
    password: ""
  });
  const [selectedRoomKey, setSelectedRoomKey] = useState(null);
  const [inputPassword, setInputPassword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState(""); // 검색 키워드
  const [showWaitingOnly, setShowWaitingOnly] = useState(false); // 대기방만 보기 상태

  // 방 목록 조회
  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/rooms/all');
      // console.log("방 목록 조회 성공 - 응답 데이터:", response.data);

      // 서버 응답이 배열인지 확인하고, 배열이 아니면 객체의 값을 배열로 변환
      const roomsArray = Array.isArray(response.data) ? response.data : Object.values(response.data);

      //   setRooms(response.data);
      setRooms(roomsArray); // rooms 상태에 배열로 저장
      setFilteredRooms(roomsArray); // 필터 초기화

    } catch (error) {
      console.error("방 목록 조회 실패 - 오류:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms(); // 검색어 변경 시 필터링 실행
  }, [ showWaitingOnly, rooms]);

  // 함수 정의
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      filterRooms(); // Enter 키가 눌렸을 때 필터링 로직 실행
    }
  };

  // 방 필터링
  const filterRooms = () => {
    let filtered = rooms;

    if (showWaitingOnly) {
      filtered = filtered.filter(room => !room.isPlaying); // 게임 중인 방 제외
    }

    if (searchKeyword) {
      filtered = filtered.filter(room => room.roomName.includes(searchKeyword)); // 검색어 필터링
    }

    setFilteredRooms(filtered);
  };


  // Input 값이 변경될 때 호출되는 함수
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // 방 생성 모달 열기, 닫기
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setRoomDetails({ roomName: "", maxPlayers: 8, isPrivate: false, password: "" });
  };

  // 비밀번호 입력 모달 열기, 닫기
  const openPasswordModal = (roomKey) => {
    setSelectedRoomKey(roomKey);
    setIsPasswordModalOpen(true);
  };
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setInputPassword("");
  };

  // 방 생성
  const handleCreateRoom = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/rooms/create', roomDetails, {
        withCredentials: true
      });
      const { player, roomKey } = response.data;
      console.log("방 생성 성공 - 응답 데이터:", response.data);
      if (player && roomKey) {
        sessionStorage.setItem("player", JSON.stringify(player));
        sessionStorage.setItem("roomKey", roomKey);
        navigate(`/rooms/${roomKey}`);
      }
      closeModal();
      fetchRooms();
    } catch (error) {
      console.error("방 생성 실패:", error);
      alert("방 생성에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  // 입장 시 비밀번호 필요 여부 확인 후 처리
  const handleJoinRoom = async (roomKey, isPrivate) => {
    if (isPrivate) {
      openPasswordModal(roomKey);
    } else {
      tryJoinRoom(roomKey);
    }
  };

  // 방 입장
  const tryJoinRoom = async (roomKey) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/rooms/${roomKey}/join`,
        { password: inputPassword },
        { withCredentials: true }
      );
      const { player } = response.data;
      if (player) {
        sessionStorage.setItem("player", JSON.stringify(player));
        sessionStorage.setItem("roomKey", roomKey);
        navigate(`/rooms/${roomKey}`);
      }
      closePasswordModal();
    } catch (error) {
      handleJoinError(error);
    }
  };

  // 입장 오류 처리
  const handleJoinError = (error) => {
    if (error.response) {
      const errorMessage = error.response.data.error || '알 수 없는 오류가 발생했습니다.';
      switch (error.response.status) {
        case 401:
          alert('로그인이 필요합니다.');
          navigate('/');
          break;
        case 404:
          alert('존재하지 않는 방입니다.');
          fetchRooms();
          break;
        case 409:
          alert('방이 가득 찼거나 게임이 진행 중입니다.');
          fetchRooms();
          break;
        case 403:
          alert('비밀번호가 일치하지 않습니다.');
          break;
        default:
          alert(errorMessage);
      }
    } else if (error.request) {
      alert('서버에 연결할 수 없습니다.');
    } else {
      alert('방 입장 중 오류가 발생했습니다.');
    }
  };

  return (

    <div className="room-list-container">
      <header className="header">
        <button className="create-room-button" onClick={openModal}>방 만들기</button>
        <div className="filter-box">
          <label className="filter-label">
          대기방만 보기
            <input
              type="checkbox"
              checked={showWaitingOnly}
              onChange={() => setShowWaitingOnly(!showWaitingOnly)}
            />
          </label>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)} // 검색어 상태 업데이트
            onKeyDown={(e) => handleKeyDown(e)} // Enter 키 입력 처리
          />
        </div>
      </header>

      <div className="room-list">
      {filteredRooms.length > 0 ? (
        filteredRooms.map(room => (
          <div className="room-item" key={room.roomKey}>
            <div className="room-title-container">
             
              <div className="room-title">{room.roomKey}. {room.roomName}</div>
              {room.isPrivate && <div className="lock-icon">🔒</div>} {/* 비밀방 아이콘 추가 */}
            </div>
            <div className="room-status">

              <span className={room.players?.length >= room.maxPlayers ? 'full' : 'available'}>
                {room.players?.length || 0}/{room.maxPlayers}명
              </span>
              {room.isPlaying ? (
                <span className="in-progress">게임중</span>
              ) : (
                <span className="in-progress">대기중</span>
              )}
            </div>
            <button
              className="enter-button"
              onClick={() => handleJoinRoom(room.roomKey, room.isPrivate)}
              disabled={room.players?.length >= room.maxPlayers || room.isPlaying}
            >
              입장
            </button>
          </div>
        ))
      ) : (
        <div className="room-no-results">검색 결과가 없습니다.</div>
      )}
      
      </div>

      {/* 방 생성 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>방 만들기</h2>
            <label>방 제목</label>
            <input
              type="text"
              name="roomName"
              placeholder="방 제목을 입력하세요"
              value={roomDetails.roomName}
              onChange={(e) => handleInputChange(e)}
            />

            <label>최대 인원</label>
            <input
              type="number"
              name="maxPlayers"
              min="1"
              max="12"
              value={roomDetails.maxPlayers}
              onChange={(e) => handleInputChange(e)}
            />

            <div className="password-section">
              <label>비밀번호 여부</label>
              <div className="toggle-switch" onClick={() => setRoomDetails(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}>
                <div className={`switch ${roomDetails.isPrivate ? 'active' : ''}`}></div>
              </div>
              {roomDetails.isPrivate && (
                <input
                  type="password"
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  className="password-input"
                  value={roomDetails.password}
                  onChange={(e) => handleInputChange(e)}
                />
              )}
            </div>

            <div className="modal-buttons">
              <button onClick={closeModal}>취소</button>
              <button onClick={handleCreateRoom}>생성</button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 입력 모달 */}
      {isPasswordModalOpen && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>비밀번호 입력</h2>
            <input
              type="password"
              name="inputPassword"
              placeholder="비밀번호"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={closePasswordModal}>취소</button>
              <button onClick={() => tryJoinRoom(selectedRoomKey)}>입장</button>
            </div>
          </div>
        </div>
      )}
    </div>



  );
};

export default TestLobby;
