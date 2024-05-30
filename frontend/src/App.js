import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';  
import axiosInstance from "./axiosInstance";
import Register from './Register';
import { AuthProvider } from './AuthContext';
import Login from './Login';
import "./App.css";
import Rules from './Rules';
import AuthErrorDisplay from './AuthErrorDisplay';

axiosInstance.defaults.baseURL = "http://127.0.0.1:8090/api"


const baseURL =
  process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8090/api";
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
              </Routes>
          </Router>
        </AuthProvider>
      );
}
  
  export default App;