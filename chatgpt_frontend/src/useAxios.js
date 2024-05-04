import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8090/api',
    /* інші глобальні налаштування */
});

// Функція для створення налаштованого інстансу з контекстом історії
export function useAxios() {
    const navigate = useNavigate();

    // Перехоплювач відповідей
    axiosInstance.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config;
            // Перевіряємо, чи повернув сервер код статусу 401
            if (!originalRequest._retry && error.response.status === 401) {
                // Перенаправлення на сторінку логіну
                originalRequest._retry = true;
                try{
                const refreshToken = localStorage.getItem('refreshToken');
                const { data } = await axios.post('http://localhost:8090/api/users/token/refresh/', { refresh: refreshToken });
                localStorage.setItem('accessToken', data.access);
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
                return axios(originalRequest);  // Повторне відправлення оригінального запиту з новим токеном
            }
                catch (error) {
                    console.error('Unauthorized: ',error)
                    navigate('/users/register');
                }
                
                
                
            }
            return Promise.reject(error);
        }
    );

    return axiosInstance;
}