import React, { useState } from 'react';
import axiosInstance from './axiosInstance';
import AuthErrorDisplay from './AuthErrorDisplay';

function Login() {
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        user_type: 'student'
    });
    const [errorMessage, setErrorMessage] = useState('');
    const error  = localStorage.getItem('error');

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    function formatErrors(errorData) {
      let errorMessages = [];
      if (errorData.username || errorData.password) {
          errorMessages.push("Невірний логін або пароль");
      }
      return errorMessages.join(' ');
  }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(`/users/token/`, userData);

            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            console.log('User logged in:', response.data);
            window.location.href = '/';  
        } catch (error) {
            alert("Введено неправильний логін або пароль!");
            console.error('Login error:', error);
            if (error.response) {
              setErrorMessage(formatErrors(error.response.data) || "Сталась невідома помилка");
              localStorage.removeItem('error');
          } else {
              setErrorMessage('No response from server');
          }
        }
    };

    return (
        <div className='auth-page'>
            <form className="auth-card" onSubmit={handleSubmit}>
                <h2 className="auth-title">Вхід в акаунт</h2>
                <div className="auth-field">
                    <label className="auth-label" htmlFor="login-username">Логін</label>
                    <div className="auth-input-wrapper">
                        <ion-icon name="mail-outline"></ion-icon>
                        <input
                            id="login-username"
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            placeholder="Логін"
                        />
                    </div>
                </div>
                <div className="auth-field">
                    <label className="auth-label" htmlFor="login-password">Пароль</label>
                    <div className="auth-input-wrapper">
                        <ion-icon name="lock-closed-outline"></ion-icon>
                        <input
                            id="login-password"
                            className="auth-password"
                            type="password"
                            name="password"
                            placeholder="···"
                            value={userData.password}
                            onChange={handleChange}
                        />
                        <ion-icon className="show-hide" name="eye-outline"></ion-icon>
                    </div>
                </div>
                <AuthErrorDisplay error={error} errorMessage={errorMessage} />
                <button className="auth-submit" type="submit">Ввійти</button>
                <div className="auth-footer">
                    <span>Немає акаунту?</span>
                    <a href='/users/register'>Зареєструватися</a>
                </div>
            </form>
        </div>
    );
}

export default Login;
