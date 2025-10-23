import React from "react";

const PlatformSwitcher = ({ platform, onPlatformChange, selectedModelLabel }) => {
  const handleChange = (event) => {
    onPlatformChange(event.target.value);
  };

  return (
    <div className="platform-switcher">
      <label htmlFor="platform-select">
        Платформа
        {selectedModelLabel && (
          <span className="selected-model-display"> · {selectedModelLabel}</span>
        )}
      </label>
      <select
        id="platform-select"
        value={platform}
        onChange={handleChange}
      >
        <option value="openai">OpenAI</option>
        <option value="gemini">Gemini</option>
        <option value="mistral">Mistral</option>
      </select>
    </div>
  );
};

export default PlatformSwitcher;
