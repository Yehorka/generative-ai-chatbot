import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

const baseURL =
  process.env.REACT_APP_BACKEND_URL;

const DropdownMenu = ({selectedChatId }) => {
    const [selectedModel, setSelectedModel] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchModel = async () => {
        try {
            const response = await axiosInstance.get(`${baseURL}/chat/${selectedChatId}/`);
            setSelectedModel(response.data.gpt_model);  
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch model', error);
            setLoading(false);
        }
    };

    const updateModel = async (model) => {
        try {
            await axiosInstance.put(`${baseURL}/chat/${selectedChatId}/`, { gpt_model: model });
            console.log('Model updated successfully');
        } catch (error) {
            console.error('Failed to update model', error);
        }
    };

    useEffect(() => {
        fetchModel();
    }, [selectedChatId]);

    const handleChange = (event) => {
        const newModel = event.target.value;
        setSelectedModel(newModel);
        updateModel(newModel);
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <select value={selectedModel} onChange={handleChange}>
                <option value="gpt-4">OpenAI GPT-4</option>
                <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
            </select>
        </div>
    );
};

export default DropdownMenu;