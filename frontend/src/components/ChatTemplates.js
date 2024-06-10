import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../axiosInstance';
import { API_URL } from '../config';

function ChatTemplates({ onTemplateSelect }) {

    const [userType, setUserType] = useState('');
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        axiosInstance.get(`/users/`)
            .then(response => {
                const userType = response.data.user_type; 
                setUserType(userType);
                
                if (userType === 'student') {
                    setTemplates([
                        "Наведи методичні матеріали на тему:",
                        "Допоможи з виконанням завдання:",
                        "Підготуй конспект на тему"
                    ]);
                    console.log(response.data.user_type)
                } else if (userType === 'teacher') {
                    setTemplates([
                        "Зробити перевірку на використання штучного інтелекту:",
                        "На основі наведеного конспекту підготувати тест для студентів:",
                        "Перевірка завдання на правильність виконання:"
                    ]);
                }
            })
            .catch(error => {
                console.error('Failed to fetch user type', error);
            });
    },[]); 


    return (
        <div>
            {templates.map((template, index) => (
                <button key={index} onClick={() => onTemplateSelect(template)}>
                    {template}
                </button>
            ))}
        </div>
    );
}

export default ChatTemplates;