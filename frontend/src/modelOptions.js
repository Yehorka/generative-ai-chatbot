export const MODEL_OPTIONS = {
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

export const MODEL_INFO = {
  'gpt-4o-mini': 'GPT-4o mini — швидка та економна модель для щоденних завдань.',
  'gpt-4o': 'GPT-4o — універсальна модель для інтерактивних сценаріїв.',
  'gpt-5': 'GPT-5 — флагманська модель з найкращою якістю відповідей.',
  'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite — швидка модель Google для інтерактивних задач.',
  'mistral-small-latest': 'Mistral Small Latest — баланс швидкодії та якості від Mistral AI.',
};
