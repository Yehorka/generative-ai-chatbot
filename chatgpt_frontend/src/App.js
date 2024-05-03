import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';  // Це ваша існуюча початкова сторінка
   // Це новий компонент, який ви створили
import axios from "axios";
import Register from './Register';

axios.defaults.baseURL = "http://localhost:8000/api"

const baseURL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";
function App() {
      return (
          <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<Register />} />

              </Routes>
          </Router>
      );
}
  
  export default App;