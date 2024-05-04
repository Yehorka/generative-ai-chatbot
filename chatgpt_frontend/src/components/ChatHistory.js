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
        Chat {chats.length - index}<div className='delete' onClick={() => deleteChat(chat.id)}>delete</div>
      </div>
      {index !== chats.length - 1 && <hr />}
    </div>
  ))}
</div>

  );
};

export default ChatHistory;
