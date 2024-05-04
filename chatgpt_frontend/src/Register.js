import React, { useState } from 'react';
import axiosInstance from './axiosInstance';
import { useAxios } from './useAxios';

function Register() {
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
            const response = await axiosInstance.post('http://localhost:8090/api/users/register/', userData);
            const response2 = await axiosInstance.post('http://localhost:8090/api/users/token/', userData);

            localStorage.setItem('accessToken', response2.data.access);
            localStorage.setItem('refreshToken', response2.data.refresh);
            console.log('User registered:', response.data);
            console.log('User logged in:', response2.data);

            // Redirect or handle response data
        } catch (error) {
            console.error('Registration error:', error.response);
            console.error('Registration error:', error.response2);
            // Handle errors here, e.g., show error message
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" name="username" value={userData.username} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" name="password" value={userData.password} onChange={handleChange} />
                </label>
                <br />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;