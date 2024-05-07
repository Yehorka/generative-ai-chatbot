import React, { useState } from 'react';
import axiosInstance from './axiosInstance';
import { useAxios } from './useAxios';

function Login() {
    //const axios = useAxios();
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        user_type: 'student'
    });

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('http://localhost:8090/api/users/token/', userData);

            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            console.log('User logged in:', response.data);
            window.location.href = '/';  
            // Redirect or handle response data
        } catch (error) {
            console.error('Login error:', error.response);
            // Handle errors here, e.g., show error message
        }
    };

    return (
        <div className='screen-1wrap'>
            <form onSubmit={handleSubmit}>
        <div className="screen-1">
        <h2>Вхід в акаунт</h2>
  <div className="email">
    <label for="email">Login</label>
    <div className="sec-2">
      <ion-icon name="mail-outline"></ion-icon>
      <input type="text" name="username" value={userData.username} onChange={handleChange} placeholder="Username"/>
    </div>
  </div>
  <div className="password">
    <label for="password">Password</label>
    <div className="sec-2">
      <ion-icon name="lock-closed-outline"></ion-icon>
      <input className="pas" type="password" name="password" placeholder="············" value={userData.password} onChange={handleChange}/>
      <ion-icon className="show-hide" name="eye-outline"></ion-icon>
    </div>
  </div>
  <button className="login">Ввійти </button>
  
  <div className="footer1"><span><a href='/users/register'>Зареєструватися</a></span><span>Forgot Password?</span></div>
  
</div>
</form>
</div>
    );
}

export default Login;