import React, { useState } from 'react';
import axiosInstance from './axiosInstance';
import { FaUniregistry } from 'react-icons/fa';

function Register() {

    const [userData, setUserData] = useState({
        username: '',
        password: '',
        user_type: ''
    });
    const handleCheckboxChange = (e) => {
      setAgree(e.target.checked);
  };

    const [agree, setAgree] = useState(false);
    
    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agree) {
          alert("Ви повинні погодитися з правилами користування чатботом.");
          return;
      }
      if (!userData.username) {
        alert("Введіть ім'я");
        return;
}
if (!userData.password) {
  alert("Введіть пароль");
  return;
}
if (!userData.user_type) {
  alert("Оберіть тип користувача ще раз");
  return;
}

        try {
            const response = await axiosInstance.post('http://localhost:8090/api/users/register/', userData);
            console.log('User registered:', response.data);

            const response2 = await axiosInstance.post('http://localhost:8090/api/users/token/', userData);

            localStorage.setItem('accessToken', response2.data.access);
            localStorage.setItem('refreshToken', response2.data.refresh);
            
            console.log('User logged in:', response2.data);
            window.location.href = '/';  

            // Redirect or handle response data
        } catch (error) {
            console.error('Registration error:', error.response);
            console.error('Registration error:', error.response2);
            alert("Користувач вже існує!");
            // Handle errors here, e.g., show error message
        }
    };

    return (
        <div className='screen-1wrap'>
            <form onSubmit={handleSubmit}>
        <div className="screen-1">
        <h2>Реєстрація</h2>
  <div className="email">
    <label for="email">Логін</label>
    <div className="sec-2">
      <ion-icon name="mail-outline"></ion-icon>
      <input type="text" name="username" value={userData.username} onChange={handleChange} placeholder="Username"/>
    </div>
  </div>
  <div className="password">
    <label for="password">Пароль</label>
    <div className="sec-2">
      <ion-icon name="lock-closed-outline"></ion-icon>
      <input className="pas" type="password" name="password" placeholder="············" value={userData.password} onChange={handleChange}/>
      <ion-icon className="show-hide" name="eye-outline"></ion-icon>

    </div>

  </div>

  <div className="type">
    <label htmlFor="role">Оберіть роль:</label>
                <select id="role" type="user_type" name="user_type" value={userData.user_type} onChange={handleChange}>
                    <option value="student">Студент</option>
                    <option value="teacher">Викладач</option>
                </select>
                </div>
                <div className="terms">
                        <input type="checkbox" id="agree" checked={agree} onChange={handleCheckboxChange} />
                        <label htmlFor="agree">Я погоджуюся з <a href='#'>правилами користування чатботом</a></label>
                    </div>
  <button className="login">Зареєструватися</button>
  
  <div className="footer1"><span><a href='/users/login'>Вхід в акаунт</a></span></div>
  
</div>
</form>
</div>
    );
}

export default Register;