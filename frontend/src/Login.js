import React, { useState } from 'react';
import axiosInstance from './axiosInstance';
import AuthErrorDisplay from './AuthErrorDisplay';
import { API_URL } from './config';

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
        <div className='screen-1wrap'>
            <form onSubmit={handleSubmit}>
        <div className="screen-1">
        <h2>Вхід в акаунт</h2>
  <div className="email">
    <label for="email">Логін</label>
    <div className="sec-2">
      <ion-icon name="mail-outline"></ion-icon>
      <input type="text" name="username" value={userData.username} onChange={handleChange} placeholder="Логін"/>
    </div>
  </div>
  <div className="password">
    <label for="password">Пароль</label>
    <div className="sec-2">
      <ion-icon name="lock-closed-outline"></ion-icon>
      <input className="pas" type="password" name="password" placeholder="···" value={userData.password} onChange={handleChange}/>
      <ion-icon className="show-hide" name="eye-outline"></ion-icon>
    </div>

  </div>
  <AuthErrorDisplay error={error} errorMessage={errorMessage} />
  <button className="login">Ввійти </button>
  
  <div className="footer1"><span><a href='/users/register'>Зареєструватися</a></span><span></span></div>
  
</div>
</form>
</div>
    );
}

export default Login;