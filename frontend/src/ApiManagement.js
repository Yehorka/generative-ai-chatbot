import React, { useEffect, useRef, useState } from 'react';
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
  const ALLOWED_INSTRUCTION_EXTENSIONS = ['.txt'];
  const MAX_INSTRUCTION_SIZE = 5 * 1024 * 1024; // 5 MB

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState({});
  const [keyInputs, setKeyInputs] = useState({
    OPENAI_API_KEY: '',
    GEMINI_API_KEY: '',
    MISTRAL_API_KEY: '',
  });
  const [instructionFiles, setInstructionFiles] = useState([]);
  const [instructionUploads, setInstructionUploads] = useState([]);
  const [uploadingInstruction, setUploadingInstruction] = useState(false);
  const instructionInputRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [adminResponse, keysResponse] = await Promise.all([
          axiosInstance.get('/apis/check-admin/'),
          axiosInstance.get('/apis/keys/'),
        ]);

        setIsAdmin(adminResponse.data.is_admin);
        applyKeyData(keysResponse.data);

        if (adminResponse.data.is_admin) {
          await loadInstructionFiles();
        }
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

  const loadInstructionFiles = async () => {
    try {
      const response = await axiosInstance.get('/apis/instructions/');
      setInstructionFiles(response.data || []);
    } catch (error) {
      console.error('Error loading instruction files:', error);
    }
  };

  const handleInstructionSubmit = async (event) => {
    event.preventDefault();
    if (!instructionUploads.length) {
      alert('Будь ласка, додайте файл з інструкціями.');
      return;
    }

    const hasInvalidFiles = instructionUploads.some((file) => {
      const lowerName = (file.name || '').toLowerCase();
      const dotIndex = lowerName.lastIndexOf('.');
      const extension = dotIndex >= 0 ? lowerName.slice(dotIndex) : '';
      return !ALLOWED_INSTRUCTION_EXTENSIONS.includes(extension) || file.size > MAX_INSTRUCTION_SIZE;
    });

    if (hasInvalidFiles) {
      alert('Дозволено лише TXT-файли розміром до 5 МБ. Перевірте файли та спробуйте знову.');
      setInstructionUploads([]);
      if (instructionInputRef.current) {
        instructionInputRef.current.value = '';
      }
      return;
    }

    try {
      setUploadingInstruction(true);
      for (const file of instructionUploads) {
        const formData = new FormData();
        formData.append('file', file);
        await axiosInstance.post('/apis/instructions/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      alert('Файли інструкцій успішно зчитано GPT-5!');
      setInstructionUploads([]);
      if (instructionInputRef.current) {
        instructionInputRef.current.value = '';
      }
      await loadInstructionFiles();
    } catch (error) {
      console.error('Error uploading instruction file:', error);
      alert('Не вдалося опрацювати файл інструкції. Перевірте формат файлу та ключ Gemini.');
    } finally {
      setUploadingInstruction(false);
    }
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

  const handleInstructionDelete = async (id) => {
    try {
      await axiosInstance.delete(`/apis/instructions/${id}/`);
      await loadInstructionFiles();
      alert('Файл інструкції видалено.');
    } catch (error) {
      console.error('Error deleting instruction file:', error);
      alert('Не вдалося видалити інструкцію.');
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
        <div className='api-management-grid'>
          {Object.keys(API_KEY_CONFIG).map(renderKeySection)}

          <section className='api-key-section'>
            <h2>Файл інструкції для чатбота</h2>
            <p>
              Додайте один або кілька файлів з інструкціями (наприклад силабус або правила
              курсу). Вміст кожного файлу буде розпізнано моделлю GPT-5 та збережено в базі даних,
              щоб кожна мовна модель могла використовувати ці інструкції. Після перезапуску
              бекенду інструкції знову зчитуються з бази даних.
            </p>

            <div className='instruction-hint'>
              Максимальний розмір одного файлу — 5 МБ. Підтримуваний формат: TXT.
            </div>

            {instructionFiles.length > 0 ? (
              instructionFiles.map((file) => (
                <div key={file.id} className='instruction-preview-block'>
                  <div className='instruction-meta'>
                    <div>
                      <strong>Назва:</strong> {file.name} | <strong>Оновлено:</strong>{' '}
                      {new Date(file.uploaded_at).toLocaleString()}
                    </div>
                    <button
                      type='button'
                      className='instruction-delete'
                      onClick={() => handleInstructionDelete(file.id)}
                    >
                      Видалити
                    </button>
                  </div>
                  <div className='instruction-preview'>
                    {file.parsed_content || 'Вміст інструкції ще не сформовано.'}
                  </div>
                </div>
              ))
            ) : (
              <p>Інструкції ще не завантажені.</p>
            )}

            <form onSubmit={handleInstructionSubmit} className='instruction-form'>
              <label>
                Файл з інструкціями:
                <input
                  ref={instructionInputRef}
                  type='file'
                  accept='.txt'
                  multiple
                  onChange={(event) => setInstructionUploads(Array.from(event.target.files || []))}
                  required
                />
              </label>
              <button type='submit' disabled={uploadingInstruction}>
                {uploadingInstruction ? 'Зчитування...' : 'Додати інструкції'}
              </button>
            </form>
          </section>
        </div>
        <p>Після введення ключів API можна вийти з акаунта.</p>
      </div>
      <Profile />
    </div>
  );
};

export default ApiManagement;
