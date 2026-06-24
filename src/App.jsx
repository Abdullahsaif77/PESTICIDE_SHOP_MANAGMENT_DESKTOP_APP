import React, { useState } from 'react';
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      <AppRoutes 
        user={currentUser} 
        onLoginSuccess={handleLoginSuccess} 
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
}

export default App;