import React, { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "./axiosInstance";

import "./App.css";
import ChatHistory from "./components/ChatHistory";
import ChatUI from "./components/ChatUI";
import Profile from "./Profile";
import Modal from "./Modal";
import { API_URL } from './config';
import PlatformSwitcher from "./components/PlatformSwitcher";
import { MODEL_OPTIONS } from './modelOptions';



function HomePage() {

    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [attachedImage, setAttachedImage] = useState(null);
    const [attachedImagePreview, setAttachedImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const [isAssistantTyping, setIsAssistantTyping] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [platform, setPlatform] = useState(() => localStorage.getItem('chatPlatform') || 'openai');
    const [selectedModel, setSelectedModel] = useState('');

    useEffect(() => {
      const bootstrap = async () => {
        try {
          await axiosInstance.get('/apis/keys/');
          const response2 = await axiosInstance.get('/users/');
          console.log('API URL:', API_URL);
          console.log(response2.data.username);
          if (response2.data.user_type === "" && response2.data.username === 'admin') {
            window.location.href = '/management/';
          }
        } catch (error) {
          console.error('Initialization error:', error);
        }
      };

      bootstrap();
    },[]);
    const fetchChats = useCallback(async () => {
      try {
        const response = await axiosInstance.get(`/chat/`, {
          params: { platform },
        });
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }, [platform]);

    useEffect(() => {
      fetchChats();
    }, [fetchChats]);

    useEffect(() => {
      localStorage.setItem('chatPlatform', platform);
      setSelectedChatId(null);
      setMessages([]);
      setIsAssistantTyping(false);
      setAttachedImage(null);
      setAttachedImagePreview(null);
      const defaultModel = MODEL_OPTIONS[platform]?.[0]?.value || '';
      setSelectedModel(defaultModel);
    }, [platform]);
  
    const fetchMessages = useCallback(async (chatId) => {
      try {
        const response = await axiosInstance.get(`/chat/${chatId}/`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }, []);

    useEffect(() => {
      if (selectedChatId) {
        fetchMessages(selectedChatId);
      } else {
        setMessages([]);
      }
      setAttachedImage(null);
      setAttachedImagePreview(null);
    }, [selectedChatId, fetchMessages]);

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleChatNameSubmit = async (name) => {
      setIsModalOpen(false);
      await createNewChat(name);
    };


    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };
  
    const handleAttachImage = useCallback((file) => {
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAttachedImage(file);
    }, []);

    const handleRemoveImage = useCallback(() => {
      setAttachedImage(null);
      setAttachedImagePreview(null);
    }, []);

    const sendMessage = async () => {
      const trimmedMessage = inputMessage.trim();
      if (!selectedChatId || (!trimmedMessage && !attachedImage)) {
        return;
      }

      const userMessage = inputMessage;
      const imageFile = attachedImage;
      const imagePreview = attachedImagePreview;

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: userMessage,
          role: "user",
          image: imagePreview,
        },
      ]);
      setInputMessage("");
      setAttachedImage(null);
      setAttachedImagePreview(null);

      setIsAssistantTyping(true);

      const delay = 1000 + Math.random() * 100;
      const currentChatId = selectedChatId;
      setTimeout(async () => {
        try {
          let payload;
          let config;
          if (imageFile) {
            payload = new FormData();
            payload.append("message", trimmedMessage);
            payload.append("image", imageFile);
            config = { headers: { "Content-Type": "multipart/form-data" } };
          } else {
            payload = { message: trimmedMessage };
          }

          const response = await axiosInstance.post(
            `/chat/${currentChatId}/content/`,
            payload,
            config,
          );
          const assistantMessage = response.data;
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              content: assistantMessage.content,
              role: assistantMessage.role,
              image: assistantMessage.image,
            },
          ]);
        } catch (error) {
          console.log("Error sending message:", error);
          const errorDetail =
            error.response?.data?.detail ||
            "⚠️ An error occurred while sending the message. Please make sure the backend is running and API keys are configured in the .env file.";
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              content: errorDetail,
              role: "assistant",
            },
          ]);
        } finally {
          setIsAssistantTyping(false);
        }
      }, delay);
    };
  
    const createNewChat = async (name) => {
      try {
        const response = await axiosInstance.post(`/chat/`, {
          name: name,
          platform: platform,
          model_name:
            platform === 'gemini'
              ? 'gemini-2.5-flash-lite'
              : platform === 'mistral'
              ? 'mistral-small-latest'
              : 'gpt-4o-mini',
        });
        const newChat = response.data;

        setChats((prevChats) => [newChat, ...prevChats]);
        setSelectedChatId(newChat.id);
      } catch (error) {
        console.error("Error creating a new chat:", error);
      }
    };

   const deleteChat = async (chatId) => {
      try {
        const targetId = chatId || selectedChatId;
        if (!targetId) {
          return;
        }
        await axiosInstance.delete(`/chat/${targetId}`);
        setSelectedChatId(null);
        fetchChats();
      } catch (error) {
        console.error("Error deleting a chat:", error);
      }
    };
  
    function formatMessageContent(content) {
      const sections = content.split(/(```[\s\S]*?```|`[\s\S]*?`)/g);
      return sections
        .map((section) => {
          if (section.startsWith("```") && section.endsWith("```")) {
            section = section.split("\n").slice(1).join("\n");
            const code = section.substring(0, section.length - 3);
            return `<pre><code class="code-block">${code}</code></pre>`;
          } else if (section.startsWith("`") && section.endsWith("`")) {
            const code = section.substring(1, section.length - 1);
            return `<code class="inline-code">${code}</code>`;
          } else {
            return section.replace(/\n/g, "<br>");
          }
        })
        .join("");
    }
    const handleMessageChange = (message) => {
      setInputMessage(message);  
    };
  
    return (
      
      <div className="App">

        <div className="chat-container">
          <div className="chat-history-container">
          <button className="new-chat-button" onClick={openModal}>Створити новий чат</button>
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleChatNameSubmit}
            />
            <PlatformSwitcher
              platform={platform}
              onPlatformChange={setPlatform}
              selectedModelLabel={(() => {
                const platformOptions = MODEL_OPTIONS[platform] || [];
                const activeModel = selectedModel || platformOptions[0]?.value || '';
                return platformOptions.find((option) => option.value === activeModel)?.label || '';
              })()}
            />
            <ChatHistory
              chats={chats}
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
              deleteChat={deleteChat}
            />
            <Profile></Profile>
          </div>
          <ChatUI
            messages={messages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            sendMessage={sendMessage}
            formatMessageContent={formatMessageContent}
            isAssistantTyping={isAssistantTyping}
            messagesEndRef={messagesEndRef}
            selectedChatId={selectedChatId}
            handleMessageChange={handleMessageChange}
            platform={platform}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onAttachImage={handleAttachImage}
            onRemoveImage={handleRemoveImage}
            attachedImagePreview={attachedImagePreview}
            hasAttachment={Boolean(attachedImage)}
          >

            </ChatUI>
        </div>
        <div className="footer">
        Помічник може помилятися. Перевіряйте важливу інформацію та дотримуйтесь  <a href="/rules">правил</a>
        </div>
      </div>
    );
  }
  
  export default HomePage;
  