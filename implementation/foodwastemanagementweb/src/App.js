import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavComponent from './components/Nav';
import Home from './pages/home'; 
import Donate from './pages/donate'; 
import Community from './pages/community';
import Account from './pages/account';
import Chats from './pages/chats';
import Login from './pages/login';
import Register from './pages/register';
// import { AuthProvider } from './AuthContext';
// import ProtectedRoute from './ProtectedRoute';


function App() {
  return (
    <Router>
      <div>
        <NavComponent />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/account" element={<Account />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
