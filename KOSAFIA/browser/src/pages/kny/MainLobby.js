// import React from 'react';

// import Chat from '../../components/KnyComponents/Chat';
// import { useUser } from '../../contexts/KNY/UserContext';


// const MainLobby = () => {


//     // // 세션에서 사용자 이름을 가져옵니다.
//     // const username = sessionStorage.getItem('USERNAME');

//     const {user} = useUser();

//     return (
//         // 전체를 감싸는 컨테이너
//         <div style={{ padding: '20px' }}>
//             {/* 상단 헤더 영역 */}
//             <div style={{ 
//                 backgroundColor: '#f0f0f0',
//                 padding: '10px',
//                 borderRadius: '5px'
//             }}>
//                 <h1>마피아 게임 로비</h1>
//                 <p>{user.username}님 환영합니다!</p>
//             </div>

//             {/* 메인 컨텐츠 영역 */}
//             <div style={{
//                 display: 'flex',
//                 marginTop: '20px',
//                 gap: '20px'
//             }}>
//                 {/* 왼쪽: 게임방 목록 영역 */}
//                 <div style={{
//                     flex: '2',
//                     backgroundColor: 'white',
//                     padding: '15px',
//                     borderRadius: '5px',
//                     boxShadow: '0 0 5px rgba(0,0,0,0.1)'
//                 }}>
//                     <h2>게임방 목록</h2>
//                     <p>아직 방이 없습니다...</p>
//                 </div>

//                 {/* 오른쪽: 채팅 영역 */}
//                 <div style={{
//                     flex: '1',
//                     backgroundColor: 'white',
//                     padding: '15px',
//                     borderRadius: '5px',
//                     boxShadow: '0 0 5px rgba(0,0,0,0.1)'
//                 }}>
//                     <h2>로비 채팅</h2>
//                     {/* <p>채팅 기능 준비중...</p> */}
//                     <Chat/>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default MainLobby;

//===========================위에는 세션에 로그인할걸 고려한 매인로비페이지 내용========================

//===========================아래는 진짜 채팅방만 ========================
import React from 'react';
// import Chat from '../../components/KnyComponents/oldstable/Chat'; <- 구시대 산물
import LobbyChat from '../../components/kny/chat/LobbyChat';
import UserList from '../../components/kny/list/UserList';
import { useStompClientContext } from '../StompClientContext';
const MainLobby = () => {
    const { connected, userList } = useStompClientContext();  // 소켓 컨텍스트 사용

    return (
        <div style={{ padding: '20px' }}>
            {/* 연결 상태 표시 */}
            <div style={{
                padding: '10px',
                backgroundColor: connected ? '#e8f5e9' : '#ffebee',
                marginBottom: '20px'
            }}>
                {connected ? '서버와 연결됨' : '연결 중...'}
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                {/* 유저 리스트 */}
                <div style={{ flex: '1' }}>
                    <UserList users={userList || []} />  {/* 빈 배열을 기본값으로 제공 */}
                </div>

                {/* 채팅 영역 */}
                <div style={{ flex: '2' }}>
                    <LobbyChat />
                </div>
            </div>
        </div>
    );
};

export default MainLobby;