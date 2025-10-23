import React from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";
import DropdownMenu from "../DropdownMenu";
import ChatTemplates from "./ChatTemplates"

const ChatUI = ({
  messages,
  inputMessage,
  setInputMessage,
  sendMessage,
  formatMessageContent,
  isAssistantTyping,
  messagesEndRef,
  selectedChatId,
  handleMessageChange,
  platform,
}) => {
  return (
    <div className="chat-ui">
      <DropdownMenu selectedChatId={selectedChatId} platform={platform} />
      <div className="chat-messages">
      {messages.map((message, index) => (
          <Message
            key={index}
            message={message}
            formatMessageContent={formatMessageContent}
          />
        ))}
        {isAssistantTyping && (
          <div className="message assistant">
            <div className="typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
        {selectedChatId ? 
        <ChatTemplates onTemplateSelect={handleMessageChange}/>
        : null}
        
      </div>
      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        sendMessage={sendMessage}
        handleMessageChange={handleMessageChange}
        selectedChat={selectedChatId}
      />
    </div>
  );
};

export default ChatUI;
