import React, { useState } from 'react';
import axiosInstance from "./axiosInstance";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axiosInstance.post('http://localhost:8000/api/token/', {
                username,
                password,
            });
            console.log(response.data); // You'd save the tokens here
        } catch (error) {
            console.error('Login error', error.response);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Username:
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label>
                Password:
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;