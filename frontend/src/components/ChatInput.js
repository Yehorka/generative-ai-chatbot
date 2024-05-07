import React, {useState} from "react";

// import send icon from react-icons/fa
import { FaPaperPlane } from "react-icons/fa";
import ChatTemplates from "./ChatTemplates";

const ChatInput = ({ inputMessage, setInputMessage, sendMessage }) => {
  return (
    <div className="chat-input">
      <textarea
        placeholder="Введіть повідомлення"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (inputMessage) {
              sendMessage();
            }
          }          
        }}
      />
      <button><i className="fa-solid fa-plus"></i></button>
      <button onClick={sendMessage} disabled={!inputMessage}>
        <FaPaperPlane/>
      </button>
    </div>
  );
};

export default ChatInput;
