// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
    path="/home/:userId"
    element={
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    }
  />
      </Routes>
    </Router>
  );
};

export default App;
