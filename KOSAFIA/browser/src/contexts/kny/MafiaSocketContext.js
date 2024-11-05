// contexts/Mafia/MafiaSocketContext.js
import { BaseSocketProvider, useBaseSocket } from '../Base/BaseSocketContext';

export const MafiaSocketProvider = ({ children }) => {
    return (
        <BaseSocketProvider 
            config={{
                endpoint: '/wstomp',
                topics: ['/topic/lobby', '/topic/users', '/topic/rooms']
            }}
        >
            {/* 마피아 게임 전용 추가 로직 */}
            {children}
        </BaseSocketProvider>
    );
};