
//-----백만 구현----
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import Modal from 'react-modal';

// function TestLobby() {
//     const navigate = useNavigate();
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
//     const [roomDetails, setRoomDetails] = useState({
//         roomName: "",
//         maxPlayers: 8,
//         isPrivate: false,
//         password: ""
//     });
//     const [rooms, setRooms] = useState([]);
//     const [selectedRoomKey, setSelectedRoomKey] = useState(null);
//     const [inputPassword, setInputPassword] = useState("");

//     const fetchRooms = async () => {
//         try {
//             const response = await axios.get('http://localhost:8080/api/rooms/all');
//             console.log("방 목록 조회 성공 - 응답 데이터:", response.data);
//             const roomsArray = Array.isArray(response.data) ? response.data : Object.values(response.data);
//             setRooms(roomsArray);
//         } catch (error) {
//             console.error("방 목록 조회 실패 - 오류:", error);
//         }
//     };

//     useEffect(() => {
//         fetchRooms();
//     }, []);

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setRoomDetails((prevDetails) => ({
//             ...prevDetails,
//             [name]: type === "checkbox" ? checked : value
//         }));
//     };

//     const handleCreateRoom = async () => {
//         try {
//             const response = await axios.post('http://localhost:8080/api/rooms/create', 
//                 { 
//                     roomName: roomDetails.roomName, 
//                     maxPlayers: Number(roomDetails.maxPlayers), 
//                     isPrivate: Boolean(roomDetails.isPrivate), 
//                     password: roomDetails.password 
//                 }, 
//                 { withCredentials: true }
//             );
//             console.log("방 생성 성공 - 응답 데이터:", response.data);

//             const { player, roomKey } = response.data; 
//             if (player) {
//                 sessionStorage.setItem("player", JSON.stringify(player));
//                 sessionStorage.setItem("roomKey", roomKey);
//                 navigate(`/rooms/${roomKey}`);
//             }
//             fetchRooms();
//         } catch (error) {
//             console.error("방 생성 실패 - 오류:", error);
//             alert("방 생성에 실패했습니다. 다시 시도해 주세요.");
//         }
//     };

//     const handleJoinRoom = async (roomKey, isPrivate) => {
//         if (isPrivate) {
//             setSelectedRoomKey(roomKey);
//             setIsPasswordModalOpen(true);
//         } else {
//             tryJoinRoom(roomKey);
//         }
//     };

//     const tryJoinRoom = async (roomKey) => {
//         try {
//             const response = await axios.post(
//                 `http://localhost:8080/api/rooms/${roomKey}/join`,
//                 { password: inputPassword },
//                 { withCredentials: true }
//             );

//             if (response.data) {
//                 sessionStorage.setItem('player', JSON.stringify(response.data.player));
//                 sessionStorage.setItem('roomKey', response.data.roomKey);
//                 navigate(`/rooms/${roomKey}`);
//             }
//         } catch (error) {
//             handleJoinError(error);
//         }
//     };

//     const handleJoinError = (error) => {
//         if (error.response) {
//             const errorMessage = error.response.data.error || '알 수 없는 오류가 발생했습니다.';
//             switch (error.response.status) {
//                 case 401:
//                     alert('로그인이 필요합니다.');
//                     navigate('/');
//                     break;
//                 case 404:
//                     alert('존재하지 않는 방입니다.');
//                     fetchRooms();
//                     break;
//                 case 409:
//                     alert('방이 가득 찼거나 게임이 진행 중입니다.');
//                     fetchRooms();
//                     break;
//                 case 403:
//                     alert('비밀번호가 일치하지 않습니다.');
//                     break;
//                 default:
//                     alert(errorMessage);
//             }
//         } else if (error.request) {
//             alert('서버에 연결할 수 없습니다.');
//         } else {
//             alert('방 입장 중 오류가 발생했습니다.');
//         }
//     };

//     return (
//         <div>
//             <h1>로비 페이지</h1>
//             <button onClick={() => setIsModalOpen(true)}>방 생성</button>

//             {/* 방 목록 표시 */}
//             <h2>생성된 방 목록</h2>
//             <ul>
//                 {rooms.map((room) => (
//                     <li key={room.roomKey}>
//                         <strong>{room.roomKey}</strong>. <strong>{room.roomName}</strong> 
//                         ({room.players?.length || 0}/{room.maxPlayers}명)
//                         {room.isPrivate && <span> 🔒</span>}
//                         <button 
//                             onClick={() => handleJoinRoom(room.roomKey, room.isPrivate)}
//                             disabled={
//                                 room.players?.length >= room.maxPlayers || 
//                                 // room.gameStatus !== 'NONE'
//                                 room.isPlaying
//                             }
//                         >
//                             {/* {room.players?.length >= room.maxPlayers ? '만원' : 
//                              room.gameStatus !== 'NONE' ? '게임중' : '입장'} */}
//                             {room.players?.length >= room.maxPlayers ? '만원' : 
//                             room.isPlaying ? '게임중' : '입장'} 
//                         </button>
//                     </li>
//                 ))}
//             </ul>

//             <Modal
//                 isOpen={isModalOpen}
//                 onRequestClose={() => setIsModalOpen(false)}
//                 contentLabel="방 생성"
//             >
//                 <h2>방 생성</h2>
//                 <input
//                     type="text"
//                     name="roomName"
//                     placeholder="방 제목"
//                     value={roomDetails.roomName}
//                     onChange={handleInputChange}
//                 />
//                 <input
//                     type="number"
//                     name="maxPlayers"
//                     placeholder="최대 인원"
//                     value={roomDetails.maxPlayers}
//                     onChange={handleInputChange}
//                     min="1"
//                     max="12"
//                 />
//                 <label>
//                     비밀방 여부:
//                     <input
//                         type="checkbox"
//                         name="isPrivate"
//                         checked={roomDetails.isPrivate}
//                         onChange={handleInputChange}
//                     />
//                 </label>
//                 {roomDetails.isPrivate && (
//                     <input
//                         type="password"
//                         name="password"
//                         placeholder="비밀번호"
//                         value={roomDetails.password}
//                         onChange={handleInputChange}
//                     />
//                 )}
//                 <button onClick={handleCreateRoom}>방 생성</button>
//                 <button onClick={() => setIsModalOpen(false)}>취소</button>
//             </Modal>

//             <Modal
//                 isOpen={isPasswordModalOpen}
//                 onRequestClose={() => setIsPasswordModalOpen(false)}
//                 contentLabel="비밀번호 입력"
//             >
//                 <h2>비밀번호 입력</h2>
//                 <input
//                     type="password"
//                     name="inputPassword"
//                     placeholder="비밀번호"
//                     value={inputPassword}
//                     onChange={(e) => setInputPassword(e.target.value)}
//                 />
//                 <button onClick={() => tryJoinRoom(selectedRoomKey)}>입장</button>
//                 <button onClick={() => setIsPasswordModalOpen(false)}>취소</button>
//             </Modal>
//         </div>
//     );
// }

// export default TestLobby;


//-----프론트만 구현----
// import React, { useState } from 'react';
// import './TestLobby.css';

// const RoomList = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);

//   const rooms = [
//     { id: 8, title: '8프브', players: '8/8', inProgress: true },
//     { id: 9, title: '구즈 프브', players: '12/12', inProgress: true },
//     { id: 10, title: '12 듀얼', players: '12/12', inProgress: true },
//     { id: 11, title: '8듀', players: '6/8', inProgress: false },
//     { id: 12, title: '따숑', players: '8/8', inProgress: true },
//     { id: 13, title: '12교주', players: '10/12', inProgress: true },
//     { id: 14, title: '와라 암!', players: '8/8', inProgress: true },
//   ];

//   const openModal = () => setIsModalOpen(true);
//   const closeModal = () => {
//     setIsModalOpen(false);
//     setIsPasswordEnabled(false);
//   };

//   const togglePasswordInput = () => setIsPasswordEnabled(!isPasswordEnabled);

//   return (
//     <div className="room-list-container">
//       <header className="header">
//         <button className="create-room-button" onClick={openModal}>방 만들기</button>
//       </header>
      
//       <div className="room-list">
//         {rooms.map(room => (
//           <div className="room-item" key={room.id}>
//             <div className="room-info">
//               <div className="room-title">{room.id}. {room.title}</div>
//             </div>
//             <div className="room-status">
//               <span className={room.players === '12/12' ? 'full' : 'available'}>
//                 {room.players}
//               </span>
//               {room.inProgress ? <span className="in-progress">게임중</span> : <span className="in-progress">대기중</span>}
//             </div>
//             <button 
//               className="enter-button" 
//               disabled={room.players === '8/8' || room.inProgress}
//             >
//               입장
//             </button>
//           </div>
//         ))}
//       </div>

//       {isModalOpen && (
//         <div className="modal-overlay" onClick={closeModal}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <h2>방 만들기</h2>
//             <label>방 제목</label>
//             <input type="text" placeholder="방 제목을 입력하세요" />
            
//             <label>최대 인원</label>
//             <input type="number" min="4" max="12" defaultValue="8" />
            
//             <div className="password-section">
//               <label>비밀번호 여부</label>
//               <div className="toggle-switch" onClick={togglePasswordInput}>
//                 <div className={`switch ${isPasswordEnabled ? 'active' : ''}`}></div>
//               </div>
//               {isPasswordEnabled && (
//                 <input 
//                   type="password" 
//                   placeholder="비밀번호를 입력하세요" 
//                   className="password-input" 
//                 />
//               )}
//             </div>

//             <div className="modal-buttons">
//               <button onClick={closeModal}>취소</button>
//               <button>생성</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RoomList;


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
  const [roomDetails, setRoomDetails] = useState({
    roomName: "",
    maxPlayers: 8,
    isPrivate: false,
    password: ""
  });
  const [selectedRoomKey, setSelectedRoomKey] = useState(null);
  const [inputPassword, setInputPassword] = useState("");

  // 방 목록 조회
  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/rooms/all');
      console.log("방 목록 조회 성공 - 응답 데이터:", response.data);

       // 서버 응답이 배열인지 확인하고, 배열이 아니면 객체의 값을 배열로 변환
       const roomsArray = Array.isArray(response.data) ? response.data : Object.values(response.data);

    //   setRooms(response.data);
      setRooms(roomsArray); // rooms 상태에 배열로 저장
    } catch (error) {
      console.error("방 목록 조회 실패 - 오류:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

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
    <div className="jiyeon">
            <div className="room-list-container">
      <header className="header">
        <button className="create-room-button" onClick={openModal}>방 만들기</button>
      </header>
      
      <div className="room-list">
        {rooms.map(room => (
          <div className="room-item" key={room.roomKey}>
            <div className="room-info">
              <div className="room-title">{room.roomKey}. {room.roomName}</div>
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
        ))}
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

    </div>
   
  );
};

export default TestLobby;
