import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';  
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8090/api',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': ``
    }
  });

export default axiosInstance;