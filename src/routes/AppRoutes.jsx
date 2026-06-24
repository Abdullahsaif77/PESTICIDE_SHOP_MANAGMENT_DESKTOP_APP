import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from "../pages/Login"
import Dashboard from '../pages/Dashboard';
import Profile from '../components/Profile'

const AppRoutes = ({ user, onLoginSuccess, onLogout , onUserUpdate }) => {
  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={<Login onLoginSuccess={onLoginSuccess} user={user} />} 
        />
        <Route 
          path="/dashboard" 
          element={<Dashboard user={user} onLogout={onLogout}  onUserUpdate={onUserUpdate} />} 
        />
        <Route 
        path='/profile'
        element={<Profile user={user}   onUserUpdate={onUserUpdate}/>}
        />
        {/* Simple fallback: Defaults to login if route doesn't match */}
        <Route path="*" element={<Login onLoginSuccess={onLoginSuccess} user={user} />} />
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;