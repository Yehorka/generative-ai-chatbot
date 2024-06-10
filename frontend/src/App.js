import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';  
import axiosInstance from "./axiosInstance";
import Register from './Register';
import { AuthProvider } from './AuthContext';
import Login from './Login';
import "./App.css";
import Rules from './Rules';
import AuthErrorDisplay from './AuthErrorDisplay';
import ApiManagement from './ApiManagement'
import { API_URL } from './config';

function App() {
      return (
        <AuthProvider>

          <div className="headline" >
          <a href='/'>Розумний помічник кафедри ІПЗЕ</a>
        </div>
        <AuthErrorDisplay/>
          <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/users/register" element={<Register />} />
                <Route path="/users/login" element={<Login />} />
                <Route path="/rules" element={<Rules/>} />
                <Route path="/management" element={<ApiManagement/>} />           
                <Route path="*" element={<Navigate to="/" />} />      
              </Routes>
          </Router>
        </AuthProvider>
      );
}
  
  export default App;