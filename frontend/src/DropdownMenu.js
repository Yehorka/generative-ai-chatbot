import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';
import { API_URL } from './config';

const modelInfo = {
    "gpt-3.5-turbo": "GPT-3.5 Turbo - Це оптимізована версія GPT-3.5, яка краще підходить для загальних освітніх завдань, таких як створення навчальних матеріалів та відповідь на питання студентів.",
    "gpt-4": "GPT-4 - Це більш потужна та точна модель, яка підходить для складніших освітніх завдань, таких як проведення глибоких аналізів тексту та допомога у написанні наукових робіт.",
    "gpt-4o": "GPT-4o - Це спеціалізована версія GPT-4, оптимізована для конкретних освітніх застосувань, таких як індивідуальне навчання та інтерактивні навчальні програми."
};

const DropdownMenu = ({selectedChatId }) => {
    const [selectedModel, setSelectedModel] = useState('');
    const [loading, setLoading] = useState(true);
    const [hoveredModel, setHoveredModel] = useState(null);

    const fetchModel = async () => {
        try {
            const response = await axiosInstance.get(`/chat/${selectedChatId}/`);
            setSelectedModel(response.data.gpt_model);  
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch model', error);
            setLoading(false);
        }
    };

    const updateModel = async (model) => {
        try {
            await axiosInstance.patch(`/chat/${selectedChatId}/`, { gpt_model: model });
            console.log('Model updated successfully');
        } catch (error) {
            console.error('Failed to update model', error);
        }
    };

    useEffect(() => {
        fetchModel();
    }, [selectedChatId]);

    const handleMouseEnter = (model) => {
        setHoveredModel(model);
    };

    const handleMouseLeave = () => {
        setHoveredModel(null);
    };

    const handleChange = (event) => {
        const newModel = event.target.value;
        setSelectedModel(newModel);
        updateModel(newModel);
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
        <div>Оберіть мовну модель:</div>
        <select value={selectedModel} onChange={handleChange}>
            <option 
                value="gpt-4o"
                onMouseEnter={() => handleMouseEnter('gpt-4o')}
                onMouseLeave={handleMouseLeave}
            >
                OpenAI GPT-4o
            </option>
            <option 
                value="gpt-4"
                onMouseEnter={() => handleMouseEnter('gpt-4')}
                onMouseLeave={handleMouseLeave}
            >
                OpenAI GPT-4
            </option>
            <option 
                value="gpt-3.5-turbo"
                onMouseEnter={() => handleMouseEnter('gpt-3.5-turbo')}
                onMouseLeave={handleMouseLeave}
            >
                OpenAI GPT-3.5 Turbo
            </option>
        </select>
        {hoveredModel && (
            <div className="model-info">
                <h3>{hoveredModel}</h3>
                <p>{modelInfo[hoveredModel]}</p>
            </div>
        )}
    </div>
    );
};

export default DropdownMenu;