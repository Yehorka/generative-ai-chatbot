import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';
import { MODEL_INFO, MODEL_OPTIONS } from './modelOptions';

const DropdownMenu = ({ selectedChatId, platform, selectedModel, onModelChange }) => {
  const [loading, setLoading] = useState(false);
  const [hoveredModel, setHoveredModel] = useState(null);

  useEffect(() => {
    if (!selectedChatId) {
      const fallback = MODEL_OPTIONS[platform]?.[0]?.value || '';
      onModelChange?.(fallback);
      return;
    }

    const fetchModel = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/chat/${selectedChatId}/`);
        const fallbackOptions = MODEL_OPTIONS[platform] || [];
        const modelName = response.data?.model_name || fallbackOptions[0]?.value || '';
        onModelChange?.(modelName);
      } catch (error) {
        console.error('Failed to fetch model', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [selectedChatId, platform, onModelChange]);

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
    onModelChange?.(newModel);
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
