// components/RoomChat.js
export const RoomChat = () => {
    const { messages, sendMessage } = useRoom();
    const [inputMessage, setInputMessage] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!inputMessage.trim()) return;
      
      sendMessage(inputMessage);
      setInputMessage('');
    };
  
    return (
      <div className="room-chat">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type.toLowerCase()}`}>
              {msg.type === 'CHAT' ? (
                <>
                  <span className="username">{msg.username}: </span>
                  <span className="content">{msg.content}</span>
                </>
              ) : (
                <span className="system-message">{msg.content}</span>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
          />
          <button type="submit">전송</button>
        </form>
      </div>
    );
  };