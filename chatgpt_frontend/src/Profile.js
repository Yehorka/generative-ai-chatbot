import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "./axiosInstance";
import "./App.css";

function Profile() {
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
                <div>
                    <p>{user.username}</p>
                    <p>{user.user_type}</p>
                    <div className="logout" onClick={logout()}>logout</div>
                </div>
            ) : (
                <p>No user data available.</p>
            )}
        </div>
    );
}

export default Profile;