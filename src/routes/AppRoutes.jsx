import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from "../pages/Login"
import Dashboard from '../pages/Dashboard';

const AppRoutes = ({ user, onLoginSuccess, onLogout }) => {
  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={<Login onLoginSuccess={onLoginSuccess} user={user} />} 
        />
        <Route 
          path="/dashboard" 
          element={<Dashboard user={user} onLogout={onLogout} />} 
        />
        {/* Simple fallback: Defaults to login if route doesn't match */}
        <Route path="*" element={<Login onLoginSuccess={onLoginSuccess} user={user} />} />
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;