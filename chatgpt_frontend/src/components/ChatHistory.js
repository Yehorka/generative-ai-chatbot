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
        Чат {chats.length - index}<div className='delete' onClick={() => deleteChat(chat.id)}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm7-9h2v8h-2V10zm-4 0h2v8H9V10zm-3 2v8h12V7H5v5z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg>delete</div>
      </div>
      {index !== chats.length - 1 && <hr />}
    </div>
  ))}
</div>

  );
};

export default ChatHistory;
