import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';
import Profile from './Profile';


const ApiManagement = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [apiKey, setApiKey] = useState('');
    const [existingApiKey, setExistingApiKey] = useState(null);
    const [name, setName] = useState('');
  
    useEffect(() => {
      axiosInstance.get('/apis/check-admin/')
        .then(response => {
          setIsAdmin(response.data.is_admin);
          setLoading(false);
        })
        .catch(error => {
            console.error('There was an error checking admin status!', error);
            setLoading(false);
        });
        axiosInstance.get('/apis/keys/')
              .then(response => {
                if (response.data.length > 0) {
                  setExistingApiKey(response.data[0]); 
                }
                setLoading(false);
              })
              .catch(error => {
                console.error('Error fetching API key:', error);
                setLoading(false);
              });
    }, []);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
        const response = await axiosInstance.post('/apis/keys/', { key: apiKey, name: "OPENAI_API_KEY" });
  
        if (response.status === 201) {
          alert('API Key successfully saved!');
          setApiKey(''); 
        } else {
          alert('Failed to save API Key.');
        }
      } catch (error) {
        console.error('Error saving API Key:', error);
        alert('An error occurred while saving the API Key.');
      }
    };
    const handleDelete = async () => {
        if (existingApiKey) {
          try {
            const response = await axiosInstance.delete(`/apis/keys/${existingApiKey.id}/`);
    
            if (response.status === 204) {
              alert('API Key successfully deleted!');
              setExistingApiKey(null);
            } else {
              alert('Failed to delete API Key.');
            }
          } catch (error) {
            console.error('Error deleting API Key:', error);
            alert('An error occurred while deleting the API Key.');
          }
        }
      };
  
    if (loading) {
      return <div>Loading...</div>;
    }

  if (!isAdmin) {
    const timer = setTimeout(() => {
        window.location.href = '/management/';
      }, 20000);
    return <div className='flexmanagement'><p>Ви не авторизовані для перегляду цієї сторінки, ця сторінка для адміністраторів,</p></div>;
  }

  return (
    <div className='flexmanagement'>
      {existingApiKey ? (
        <div>
          <p>Назва ключа API: {existingApiKey.name}</p>
          <p>Ключ API введено: {existingApiKey.key}</p>
          <button onClick={handleDelete}>Видалити ключ API </button>
        </div>
      ) : (
      <form onSubmit={handleSubmit}>
              <h1>Введіть ключ API</h1>
        <label>
          Ключ API:
          <input 
            type="text" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            required 
          />
        </label>
        <button type="submit">Прикріпити</button>
      </form> )}
      <Profile></Profile>
    </div>
  );
};

export default ApiManagement;