import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';  
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8090/api',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': ``
    }
  });

export default axiosInstance;