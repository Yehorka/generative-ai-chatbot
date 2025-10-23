import React from "react";

import { API_URL } from "../config";

const resolveImageSrc = (image) => {
  if (!image) {
    return null;
  }
  if (image.startsWith("data:") || image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }
  return `${API_URL}/${image}`;
};

const Message = ({ message, formatMessageContent }) => {
  const imageSrc = resolveImageSrc(message.image);
  const hasText = Boolean(message.content);

  return (
    <div className={`message ${message.role === "user" ? "user" : "assistant"}`}>
      {imageSrc && (
        <div className="message-image-wrapper">
          <img src={imageSrc} alt="Завантажене зображення" className="message-image" />
        </div>
      )}
      {hasText && (
        <div
          className="message-text"
          dangerouslySetInnerHTML={{
            __html: formatMessageContent(message.content),
          }}
        />
      )}
    </div>
  );
};

export default Message;
