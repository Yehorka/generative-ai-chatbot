import React from "react";

const PlatformSwitcher = ({ platform, onPlatformChange }) => {
  const handleChange = (event) => {
    onPlatformChange(event.target.value);
  };

  return (
    <div className="platform-switcher">
      <label htmlFor="platform-select">Платформа:</label>
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
