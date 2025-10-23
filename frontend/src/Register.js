import React, { useState } from 'react';
import axiosInstance from './axiosInstance';

function Register() {
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        user_type: 'student'
    });
    const [agree, setAgree] = useState(false);

    const handleCheckboxChange = (e) => {
        setAgree(e.target.checked);
    };

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
            const response = await axiosInstance.post(`/users/register/`, userData);
            console.log('User registered:', response.data);

            const response2 = await axiosInstance.post(`/users/token/`, userData);

            localStorage.setItem('accessToken', response2.data.access);
            localStorage.setItem('refreshToken', response2.data.refresh);
            
            console.log('User logged in:', response2.data);
            window.location.href = '/rules';  

        } catch (error) {
            console.error('Registration error:', error.response);
            console.error('Registration error:', error.response2);
            alert("Користувач вже існує!");

        }
    };

    return (
        <div className='auth-page'>
            <form className="auth-card" onSubmit={handleSubmit}>
                <h2 className="auth-title">Реєстрація</h2>
                <div className="auth-field">
                    <label className="auth-label" htmlFor="register-username">Логін</label>
                    <div className="auth-input-wrapper">
                        <ion-icon name="mail-outline"></ion-icon>
                        <input
                            id="register-username"
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            placeholder="Придумайте логін"
                        />
                    </div>
                </div>
                <div className="auth-field">
                    <label className="auth-label" htmlFor="register-password">Пароль</label>
                    <div className="auth-input-wrapper">
                        <ion-icon name="lock-closed-outline"></ion-icon>
                        <input
                            id="register-password"
                            className="auth-password"
                            type="password"
                            name="password"
                            placeholder="·········"
                            value={userData.password}
                            onChange={handleChange}
                        />
                        <ion-icon className="show-hide" name="eye-outline"></ion-icon>
                    </div>
                </div>
                <div className="auth-field">
                    <label className="auth-label" htmlFor="register-role">Оберіть роль</label>
                    <select
                        id="register-role"
                        name="user_type"
                        value={userData.user_type}
                        onChange={handleChange}
                        className="auth-select"
                    >
                        <option value="student">Студент</option>
                        <option value="teacher">Викладач</option>
                    </select>
                </div>
                <div className="auth-terms">
                    <label className="auth-terms-label" htmlFor="agree">
                        <input
                            id="agree"
                            type="checkbox"
                            checked={agree}
                            onChange={handleCheckboxChange}
                        />
                        <span>Я погоджуюся з <a href='/rules'>правилами користування чатботом</a></span>
                    </label>
                </div>
                <button className="auth-submit" type="submit">Зареєструватися</button>
                <div className="auth-footer">
                    <span>Вже маєте акаунт?</span>
                    <a href='/users/login'>Вхід в акаунт</a>
                </div>
            </form>
        </div>
    );
}

export default Register;
