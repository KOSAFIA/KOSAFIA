// components/kny/room/CreateRoomButton.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRoomButton = () => {
   const navigate = useNavigate();
   const [showModal, setShowModal] = useState(false);
   
   // 방 정보 상태 관리
   const [roomInfo, setRoomInfo] = useState({
       roomName: '',          // 방 이름
       maxPlayers: 8,         // 최대 인원 (기본값 8)
       isPrivate: false,      // 비밀방 여부
       roomPassword: ''       // 비밀번호 (비밀방인 경우만 사용)
   });

   // 방 생성 요청 처리
   const handleSubmit = async (e) => {
       e.preventDefault();
       
       try {
           console.log("방 생성 시도:", roomInfo); // 테스트용 로그

           const response = await fetch('/api/room/create', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                   ...roomInfo,
                   currentPlayers: 1,  // 방장이 첫 번째 플레이어
                   roomStatus: 'WAITING',
                   creatorId: JSON.parse(sessionStorage.getItem('USER_INFO'))?.userId // 방장 ID
               })
           });

           console.log("서버 응답:", response.status); // 테스트용 로그

           if (!response.ok) {
               throw new Error('방 생성 실패');
           }

           const data = await response.json();
           console.log("생성된 방 정보:", data); // 테스트용 로그

           // 방 생성 성공 시 해당 방으로 이동
           navigate(`/react/room/${data.roomId}`);
           
       } catch (error) {
           console.error('방 생성 에러:', error);
           alert('방 생성에 실패했습니다.');
       }
   };

   // 테스트용 방 정보 채우기 함수
   const fillTestData = () => {
       setRoomInfo({
           roomName: `테스트방_${Date.now()}`,
           maxPlayers: 8,
           isPrivate: false,
           roomPassword: ''
       });
   };

   return (
       <>
           {/* 방 생성 버튼 */}
           <button 
               onClick={() => setShowModal(true)}
               className="create-room-btn"
           >
               방 만들기
           </button>

           {/* 테스트용 버튼 */}
           <button 
               onClick={fillTestData}
               style={{ marginLeft: '10px' }}
           >
               테스트 데이터 채우기
           </button>

           {/* 방 생성 모달 */}
           {showModal && (
               <div className="modal">
                   <form onSubmit={handleSubmit}>
                       {/* 방 이름 입력 */}
                       <input
                           type="text"
                           placeholder="방 이름"
                           value={roomInfo.roomName}
                           onChange={(e) => {
                               console.log("방 이름 입력:", e.target.value); // 테스트용 로그
                               setRoomInfo({
                                   ...roomInfo,
                                   roomName: e.target.value
                               });
                           }}
                           required
                       />
                       
                       {/* 최대 인원 선택 */}
                       <select
                           value={roomInfo.maxPlayers}
                           onChange={(e) => {
                               console.log("최대 인원 선택:", e.target.value); // 테스트용 로그
                               setRoomInfo({
                                   ...roomInfo,
                                   maxPlayers: Number(e.target.value)
                               });
                           }}
                       >
                           {[4,5,6,7,8].map(num => (
                               <option key={num} value={num}>{num}명</option>
                           ))}
                       </select>

                       {/* 비밀방 설정 */}
                       <label>
                           <input
                               type="checkbox"
                               checked={roomInfo.isPrivate}
                               onChange={(e) => {
                                   console.log("비밀방 설정:", e.target.checked); // 테스트용 로그
                                   setRoomInfo({
                                       ...roomInfo,
                                       isPrivate: e.target.checked,
                                       roomPassword: '' // 비밀방 해제시 비밀번호 초기화
                                   });
                               }}
                           />
                           비밀방
                       </label>

                       {/* 비밀번호 입력 (비밀방인 경우만 표시) */}
                       {roomInfo.isPrivate && (
                           <input
                               type="password"
                               placeholder="방 비밀번호"
                               value={roomInfo.roomPassword}
                               onChange={(e) => {
                                   console.log("비밀번호 입력:", e.target.value.length, "자리"); // 테스트용 로그
                                   setRoomInfo({
                                       ...roomInfo,
                                       roomPassword: e.target.value
                                   });
                               }}
                               required
                           />
                       )}

                       {/* 버튼 그룹 */}
                       <div className="button-group">
                           <button type="submit">생성</button>
                           <button type="button" onClick={() => setShowModal(false)}>
                               취소
                           </button>
                       </div>

                       {/* 테스트용 현재 상태 표시 */}
                       <div style={{ marginTop: '10px', fontSize: '12px', color: 'gray' }}>
                           <pre>
                               현재 방 정보:
                               {JSON.stringify(roomInfo, null, 2)}
                           </pre>
                       </div>
                   </form>
               </div>
           )}
       </>
   );
};

export default CreateRoomButton;