import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "./axiosInstance";

import "./App.css";
import ChatHistory from "./components/ChatHistory";
import ChatUI from "./components/ChatUI";
import Profile from "./Profile";
import DropdownMenu from "./DropdownMenu";
import Modal from "./Modal";



const baseURL =
  process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8090/api";


function HomePage() {

    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const messagesEndRef = useRef(null);
    const [isAssistantTyping, setIsAssistantTyping] = useState(false);
    const [chatName, setChatName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(async () => {
      axiosInstance.get('/apis/keys/');
      const response2 = await axiosInstance.get('/users/');
      console.log(response2.data.username);
      if (response2.data.user_type == "" && response2.data.username == 'admin') {
          window.location.href = '/management/';  
        }
    },[]);
    useEffect(() => {

      fetchChats();

    }, []);
  
    useEffect(() => {
      if (selectedChatId) {
        fetchMessages(selectedChatId);
      } else {
        setMessages([]);
      }
    }, [selectedChatId]);
  
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
  
    const fetchChats = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken'); 
        const response = await axiosInstance.get(`${baseURL}/chat/`);
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
  
    const fetchMessages = async (chatId) => {
      try {
        const response = await axiosInstance.get(`${baseURL}/chat/${chatId}/`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
  
    const sendMessage = async () => {
      setMessages([
        ...messages,
        {
          content: inputMessage,
          role: "user",
        },
      ]);
      setInputMessage("");
  
      setIsAssistantTyping(true);
  
      try {

        const delay = 1000 + Math.random() * 100;
        setTimeout(async () => {
          try {
            const response = await axiosInstance.post(`${baseURL}/chat/${selectedChatId}/new_message/`, {
              chat_id: selectedChatId || undefined,
              message: inputMessage,
            });
  
            if (!selectedChatId) {
              setSelectedChatId(response.data.chat_id);
              setChats([{ id: response.data.chat_id }, ...chats]);
            } else {
              fetchMessages(selectedChatId);
            }
          } catch (error) {
            console.log("Error sending message:", error);
            setMessages([
              ...messages,
              {
                content:
                  "⚠️ An error occurred while sending the message. Please make sure the backend is running and OPENAI_API_KEY is set in the .env file.",
                role: "assistant",
              },
            ]);
          } finally {
            setIsAssistantTyping(false);
          }
        }, delay);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };
  
    const createNewChat = async (name) => {
      try {
        const response = await axiosInstance.post(`${baseURL}/chat/`, {
          name: name,
          gpt_model: 'gpt-3.5-turbo',
        });
        const newChat = response.data;
        
        setChats([newChat, ...chats]);
        setSelectedChatId(newChat.id);
      } catch (error) {
        console.error("Error creating a new chat:", error);
      }
    };

   const deleteChat = async () => {
      try {
        const response = await axiosInstance.delete(`${baseURL}/chat/${selectedChatId}`);
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
          >
            
            </ChatUI>
        </div>
        <div className="footer">
        Помічник може помилятися. Перевіряйте важливу інформацію та дотримуйтесь <a href="/rules">правил</a>
        </div>
      </div>
    );
  }
  
  export default HomePage;
  