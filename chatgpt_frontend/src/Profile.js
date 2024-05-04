import React from 'react';
import { useAuth } from './AuthContext';

function Profile() {
    const { user, logout } = useAuth();

    if (!user) {
        return <div>You are not logged in.</div>;
    }

    return (
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <div>Welcome, {user.username}!</div>
            <button onClick={logout}>Logout</button>
        </div>
    );
}

export default Profile;