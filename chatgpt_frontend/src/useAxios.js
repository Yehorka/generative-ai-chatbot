/*import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const axiosInstance = axios.create({
    baseURL: 'http://localhost:8090/api',

});

// Функція для створення налаштованого інстансу з контекстом історії
export function useAxios() {
    const navigate = useNavigate();

    // Перехоплювач відповідей
    axiosInstance.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config;
            if (error.response.status === 401 && !originalRequest._retry) {
              originalRequest._retry = true;
              try {
                const { data } = await axiosInstance.post('users/token/refresh', {
                  refresh: localStorage.getItem('refreshToken')
                });
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                return axiosInstance(originalRequest);
              } catch (refreshError) {
                console.error('Refresh token invalid');
                window.location.href = 'users/register'; // Перенаправлення на реєстрацію
                return Promise.reject(refreshError);
              }
            }
            return Promise.reject(error);
          }
    );

    return axiosInstance;
}*/