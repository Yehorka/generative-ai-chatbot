import React from "react";

const ChatHistory = ({ chats, selectedChatId, setSelectedChatId, deleteChat }) => {
  return (
    <div className="chat-history">
  {chats.map((chat, index) => (
    <div key={chat.id}>
      <div
        className={`chat ${
          selectedChatId === chat.id ? "selected" : ""
        }`}
        onClick={() => setSelectedChatId(chat.id)}
      >
        Чат {chats.length - index}
        {
          selectedChatId === chat.id ? <div className='delete' onClick={() => deleteChat(chat.id)}><i className="fas fa-trash-alt"></i></div> : null
        }
      </div>
      {index !== chats.length - 1 && <hr />}
    </div>
  ))}
</div>

  );
};

export default ChatHistory;
