import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from './axiosInstance';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);


function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axiosInstance.defaults.headers.common['Authorization'];
    window.location.href = '/users/login/';  
}

let isRefreshing = false;
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        if (error.response.status === 401 && !isRefreshing) {
            isRefreshing = true;
            console.log('Interceptor error:', isRefreshing);
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const { data } = await axiosInstance.post('/users/token/refresh/', { refresh: refreshToken });
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                isRefreshing = false;
                return axiosInstance(error.config);
            } catch (refreshError) {
                console.log('Refresh token is invalid, logging out...');
                isRefreshing = false;
                localStorage.setItem('error','Помилка авторизації. Будь ласка, спробуйте увійти знову.');
                handleLogout();
                return Promise.reject(refreshError);
            }
        }
        const detailMessage = error.response?.data?.detail;
        if (typeof detailMessage === 'string' && detailMessage.toLowerCase().includes('api key')) {
            alert('Помилка з ключем API, зверніться до адміністратора для поновлення ключа API');
        }

        return Promise.reject(error); 
    }
);

axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Setting interceptor auth token in headers ",token);
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            
        }
    });

    const login = async (username, password) => {
        try {
            const { data } = await axiosInstance.post('/users/login/', { username, password });
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            setUser({ username });
        } catch (error) {
            console.error('Login failed:', error);
            throw error;  
        }
    };

    const logout = () => {
        handleLogout();
        setUser(null);
        localStorage.setItem('error','Ви вийшли з акаунту, для користування програмою увійдіть знову.');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};