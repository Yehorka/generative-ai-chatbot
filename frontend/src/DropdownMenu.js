import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

const MODEL_OPTIONS = {
  openai: [
    { value: 'gpt-4o-mini', label: 'OpenAI GPT-4o mini' },
    { value: 'gpt-4o', label: 'OpenAI GPT-4o' },
    { value: 'gpt-5', label: 'OpenAI GPT-5' },
  ],
  gemini: [
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  ],
  mistral: [
    { value: 'mistral-small-latest', label: 'Mistral Small Latest' },
  ],
};

const MODEL_INFO = {
  'gpt-4o-mini': 'GPT-4o mini — швидка та економна модель для щоденних завдань.',
  'gpt-4o': 'GPT-4o — універсальна модель для інтерактивних сценаріїв.',
  'gpt-5': 'GPT-5 — флагманська модель з найкращою якістю відповідей.',
  'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite — швидка модель Google для інтерактивних задач.',
  'mistral-small-latest': 'Mistral Small Latest — баланс швидкодії та якості від Mistral AI.',
};

const DropdownMenu = ({ selectedChatId, platform }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredModel, setHoveredModel] = useState(null);

  useEffect(() => {
    if (!selectedChatId) {
      setSelectedModel('');
      return;
    }

    const fetchModel = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/chat/${selectedChatId}/`);
        const fallbackOptions = MODEL_OPTIONS[platform] || [];
        const modelName = response.data?.model_name || fallbackOptions[0]?.value || '';
        setSelectedModel(modelName);
      } catch (error) {
        console.error('Failed to fetch model', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [selectedChatId, platform]);

  const updateModel = async (model) => {
    if (!selectedChatId) {
      return;
    }

    try {
      await axiosInstance.patch(`/chat/${selectedChatId}/`, { model_name: model });
    } catch (error) {
      console.error('Failed to update model', error);
    }
  };

  const handleChange = (event) => {
    const newModel = event.target.value;
    setSelectedModel(newModel);
    updateModel(newModel);
  };

  if (!selectedChatId) {
    return null;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  const options = MODEL_OPTIONS[platform] || MODEL_OPTIONS.openai;

  const normalizedValue = options.some((option) => option.value === selectedModel)
    ? selectedModel
    : options[0]?.value || '';

  return (
    <div className="model-switcher">
      <div>Оберіть мовну модель:</div>
      <select value={normalizedValue} onChange={handleChange}>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            onMouseEnter={() => setHoveredModel(option.value)}
            onMouseLeave={() => setHoveredModel(null)}
          >
            {option.label}
          </option>
        ))}
      </select>
      {hoveredModel && (
        <div className="model-info">
          <h3>{hoveredModel}</h3>
          <p>{MODEL_INFO[hoveredModel]}</p>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
