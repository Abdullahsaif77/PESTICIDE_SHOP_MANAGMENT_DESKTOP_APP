import React, { useState } from 'react';
import AppRoutes from "./routes/AppRoutes"

function App() {
  // Global authentication state shared across routes
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      <AppRoutes 
        user={currentUser} 
        onLoginSuccess={handleLoginSuccess} 
        onLogout={handleLogout} 
      />
    </div>
  );
}

export default App;