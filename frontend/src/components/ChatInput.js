import React, { useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import VoiceRecorder from "../VoiceRecorder";

const ChatInput = ({
  inputMessage,
  setInputMessage,
  sendMessage,
  handleMessageChange,
  selectedChat,
  onAttachImage,
  onRemoveImage,
  attachedImagePreview,
  hasAttachment,
  platform,
}) => {
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onAttachImage(file);
    }
    event.target.value = "";
  };

  return (
    <div className="chat-input-container">
      {attachedImagePreview && (
        <div className="image-preview">
          <img src={attachedImagePreview} alt="Попередній перегляд" />
          <button
            type="button"
            className="image-remove-button"
            onClick={onRemoveImage}
            title="Видалити зображення"
          >
            ×
          </button>
        </div>
      )}
      <div className="chat-input">
        <textarea
          placeholder="Введіть повідомлення"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (inputMessage || hasAttachment) {
              sendMessage();
            }
          }
        }}
      />
      {platform === "openai" && (
        <>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className="image-upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedChat}
            title="Завантажити зображення"
            aria-label="Завантажити зображення"
          >
            <span className="sr-only">Завантажити зображення</span>
          </button>
        </>
      )}
      <VoiceRecorder selectedChat={selectedChat} onTranscription={handleMessageChange} />
      <button
        onClick={sendMessage}
        disabled={(!inputMessage && !hasAttachment) || !selectedChat}
      >
        <FaPaperPlane/>
      </button>
      </div>
    </div>
  );
};

export default ChatInput;
