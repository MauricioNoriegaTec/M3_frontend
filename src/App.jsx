// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignUp from './SignUp';
import Dashboard from './Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;