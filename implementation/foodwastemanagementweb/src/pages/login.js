// Login.js
import React, { useState } from 'react';
import { Link   } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../authentication/AuthContext';
import '../pages/style/loginRegister.css'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [loggedIn, setLoggedIn] = useState(false); // State to track login status




  const handleLogin = async (e) => {

    e.preventDefault();
    try {
      const response = await axios.post('http://[::1]:3000/users/login', {
        username,
        password,
      });
      const token = response.data.token; 
      login(token);
      localStorage.setItem('token', token);//for now a quick workaround

      setLoggedIn(true); // Update state to indicate successful login   

          const responseWhoAmI = await fetch('http://[::1]:3000/whoAmI', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (!responseWhoAmI.ok) {
            throw new Error('Failed to fetch user ID');
          }
          const userData = await responseWhoAmI.json();
          localStorage.setItem('id', userData);//for now a quick workaround
    } catch (error) {
      setError('Invalid username or password');
    }
    
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <button type="submit">Login</button>
        </form>
        {loggedIn && ( // Show this content if logged in
          <div>
            <p>Logged in successfully! Go to <Link to="/account">Account</Link>.</p>
          </div>
        )}
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;
