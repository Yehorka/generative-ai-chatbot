import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "./axiosInstance";
import "./App.css";
import { useAuth } from './AuthContext';

function Profile() {
    const { logout } = useAuth();    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('accessToken');  // Отримання токена з localStorage
                const response = await axiosInstance.get('http://localhost:8090/api/users/');
                setUser(response.data);  // Збереження даних користувача у стан
                setLoading(false);
            } catch (error) {
                setError(error.response ? error.response.data : 'Error fetching user data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="profile-square">
            {user ? (
                <div className="profile-flex">
                    <div>
                    <p>Здійснено вхід як: {user.username}</p>
                    <p>Роль: {user.user_type}</p>
                    </div>
                    <div className="logout" onClick={logout} >Вийти з акаунту</div>
                </div>
            ) : (
                <p>Немає інформації про користувача.</p>
            )}
        </div>
    );
}

export default Profile;