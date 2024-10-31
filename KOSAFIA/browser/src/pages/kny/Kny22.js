import TestLogin from '../../components/kny/test/TestLogin';
import LobbyChat from '../../components/kny/chat/LobbyChat';
import UserList from '../../components/kny/list/UserList';
import { LobbySocketProvider } from '../../contexts/kny/socket/LobbySocketContext';
import { BaseSocketProvider } from '../../contexts/kny/socket/BaseSocketContext';

const Kny22 = () => {
    return (
        <>
            <LobbySocketProvider>
                <div>
                    <TestLogin />
                </div>


                <div>

                    <LobbyChat />

                </div>

                <div>

                    <UserList />

                </div>

            </LobbySocketProvider>
        </>
    );
};

// 순서가 중요합니다:

// 가장 바깥에 BaseSocketProvider
// 그 다음 LobbySocketProvider
// 그 안에 실제 컴포넌트들

// 이렇게 해야 모든 컴포넌트들이 socket context에 접근할 수 있습니다.
export default Kny22;