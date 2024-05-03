import React, { useState } from 'react';
import axios from 'axios';

function Register() {
    const [userData, setUserData] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8090/api/register/', userData);
            console.log('User registered:', response.data);
            // Redirect or handle response data
        } catch (error) {
            console.error('Registration error:', error.response);
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