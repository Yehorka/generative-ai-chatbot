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
        error => {
            // Перевіряємо, чи повернув сервер код статусу 401
            if (error.response && error.response.status === 401) {
                // Перенаправлення на сторінку логіну
            navigate('/register');
            }
            return Promise.reject(error);
        }
    );

    return axiosInstance;
}