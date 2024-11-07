// 방의 정보와 기능을 쉽게 가져다 쓸 수 있게 해주는 특별한 도구예요
import { useRoomContext } from '../../../contexts/socket/room/RoomContext';

const useRoom = () => {
    // RoomContext에서 방의 모든 정보와 기능을 가져와요
    const roomContext = useRoomContext();
    return roomContext;
};

export default useRoom;
