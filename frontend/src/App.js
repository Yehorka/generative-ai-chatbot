import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import Register from './Register';
import { AuthProvider } from './AuthContext';
import Login from './Login';
import "./App.css";
import Rules from './Rules';
import AuthErrorDisplay from './AuthErrorDisplay';
import ApiManagement from './ApiManagement';

function App() {
  return (
    <AuthProvider>
      <div className="app-layout">
        <div className="headline">
          <a href="/">Розумний помічник кафедри ІПЗЕ</a>
        </div>
        <AuthErrorDisplay />
        <main className="app-main">
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/users/register" element={<Register />} />
              <Route path="/users/login" element={<Login />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/management" element={<ApiManagement />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
