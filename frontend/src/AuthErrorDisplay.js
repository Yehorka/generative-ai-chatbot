import React from 'react';
import { useAuth } from './AuthContext';


const AuthErrorDisplay = ({error, errorMessage }) => {

    if (!errorMessage && !error) return null; // Якщо помилки немає, нічого не відображаємо

    return (
        <div className="auth-error-message">
            <i class="fa-solid fa-exclamation"></i> {errorMessage}
            {error}
        </div>
    );
};

export default AuthErrorDisplay;