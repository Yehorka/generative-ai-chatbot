import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';
import Profile from './Profile';

const API_KEY_CONFIG = {
  OPENAI_API_KEY: {
    label: 'OpenAI',
    helpUrl: 'https://platform.openai.com/api-keys',
    helpText:
      'Для користування чатботом необхідно мати OpenAI API ключ. Якщо ключ відсутній, його потрібно створити за наведеним посиланням.',
  },
  GEMINI_API_KEY: {
    label: 'Gemini',
    helpUrl: 'https://aistudio.google.com/app/apikey',
    helpText:
      'Для роботи з платформою Gemini потрібен окремий API ключ, який можна згенерувати у Google AI Studio.',
  },
  MISTRAL_API_KEY: {
    label: 'Mistral',
    helpUrl: 'https://console.mistral.ai/api-keys',
    helpText:
      'Для використання моделей Mistral необхідно додати ключ API, який можна створити у Mistral Console.',
  },
};

const ApiManagement = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState({});
  const [keyInputs, setKeyInputs] = useState({
    OPENAI_API_KEY: '',
    GEMINI_API_KEY: '',
    MISTRAL_API_KEY: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [adminResponse, keysResponse] = await Promise.all([
          axiosInstance.get('/apis/check-admin/'),
          axiosInstance.get('/apis/keys/'),
        ]);

        setIsAdmin(adminResponse.data.is_admin);
        applyKeyData(keysResponse.data);
      } catch (error) {
        console.error('There was an error loading API management data!', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      const timer = setTimeout(() => {
        window.location.href = '/management/';
      }, 20000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loading, isAdmin]);

  const applyKeyData = (data) => {
    const keyed = data.reduce((acc, item) => {
      const normalizedName = (item.name || '').toUpperCase();
      acc[normalizedName] = { ...item, name: normalizedName };
      return acc;
    }, {});
    setApiKeys(keyed);
  };

  const refreshKeys = async () => {
    try {
      const response = await axiosInstance.get('/apis/keys/');
      applyKeyData(response.data);
    } catch (error) {
      console.error('Error refreshing API keys:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setKeyInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event, name) => {
    event.preventDefault();
    const trimmedValue = keyInputs[name].trim();

    if (!trimmedValue) {
      alert('Будь ласка, введіть ключ API.');
      return;
    }

    const existingKey = apiKeys[name];

    try {
      if (existingKey) {
        await axiosInstance.patch(`/apis/keys/${existingKey.id}/`, {
          key: trimmedValue,
        });
        alert('Ключ API успішно оновлено!');
      } else {
        await axiosInstance.post('/apis/keys/', {
          name,
          key: trimmedValue,
        });
        alert('Ключ API успішно додано!');
      }
      setKeyInputs((prev) => ({
        ...prev,
        [name]: '',
      }));
      await refreshKeys();
    } catch (error) {
      console.error('Error saving API Key:', error);
      alert('Помилка обробки ключа API.');
    }
  };

  const handleDelete = async (name) => {
    const existingKey = apiKeys[name];
    if (!existingKey) {
      return;
    }

    try {
      await axiosInstance.delete(`/apis/keys/${existingKey.id}/`);
      alert('Ключ API видалено!');
      setKeyInputs((prev) => ({
        ...prev,
        [name]: '',
      }));
      await refreshKeys();
    } catch (error) {
      console.error('Error deleting API Key:', error);
      alert('Сталася помилка під час видалення ключа API.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className='flexmanagement'>
        <p>
          Ви не авторизовані для перегляду цієї сторінки, ця сторінка для адміністраторів,
        </p>
      </div>
    );
  }

  const renderKeySection = (name) => {
    const config = API_KEY_CONFIG[name];
    const existingKey = apiKeys[name];

    return (
      <section key={name} className='api-key-section'>
        <h2>{config.label} API ключ</h2>
        <p>
          {config.helpText}{' '}
          <a href={config.helpUrl} target='_blank' rel='noreferrer'>
            Посилання
          </a>
        </p>
        {existingKey ? (
          <div>
            <p>Назва ключа API: {existingKey.name}</p>
            <p>Ключ API введено: {existingKey.key}</p>
            <button type='button' onClick={() => handleDelete(name)}>
              Видалити ключ API
            </button>
          </div>
        ) : (
          <p>Ключ API ще не додано.</p>
        )}
        <form onSubmit={(event) => handleSubmit(event, name)}>
          <label>
            Ключ API:
            <input
              type='text'
              value={keyInputs[name]}
              onChange={(event) => handleInputChange(name, event.target.value)}
              required
            />
          </label>
          <button type='submit'>
            {existingKey ? 'Оновити ключ API' : 'Прикріпити ключ API'}
          </button>
        </form>
      </section>
    );
  };

  return (
    <div className='flexmanagement'>
      <div>
        <h1>
          Для користування чатботом необхідно ввести чинні ключі API для обраних платформ.
        </h1>
        {Object.keys(API_KEY_CONFIG).map(renderKeySection)}
        <p>Після введення ключів API можна вийти з акаунта.</p>
      </div>
      <Profile />
    </div>
  );
};

export default ApiManagement;
