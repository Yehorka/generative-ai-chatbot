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
                const token = localStorage.getItem('accessToken');  
                const response = await axiosInstance.get('http://127.0.0.1:8090/api/users/');
                setUser(response.data);  
                setLoading(false);
            } catch (error) {
                setError(error.response ? error.response.data : 'Error fetching user data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getDisplayText = (type) => {
        if (type === 'student') {
            return "Студент";
        } else if (type === 'teacher') {
            return "Викладач";
        } else {
            return "Не визначено"; 
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="profile-square">
            {user ? (
                <div className="profile-flex">
                    <div className="profile-info">
                    <p>Здійснено вхід як: {user.username}</p>
                    <p>Роль: {getDisplayText(user.user_type)}</p>
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