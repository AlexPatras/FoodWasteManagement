import React, { useState, useEffect } from 'react';
import { useAuth } from '../authentication/AuthContext';
import '../pages/style/Account.css';

const Account = () => {
  const { user, logout } = useAuth(); // Using the user object from AuthContext
  const [accountData, setAccountData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');
  const id = localStorage.getItem('id');



  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {

        if (user) {
          const responseAccountInfo = await fetch(`http://[::1]:3000/users/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (!responseAccountInfo.ok) {
            throw new Error('Failed to fetch account information'); 
          } 
          const accountInfo = await responseAccountInfo.json();
          setAccountData(accountInfo);
        } else {
          throw new Error('User is not authenticated');
        }
      } catch (error) {
        console.error('Error fetching account information:', error);
        // Set default or mock user data in case of error or not authenticated 
        setAccountData({
          id: '12345',
          firstName: 'John',
          lastName: 'Doe',
          userName: 'johndoe',
          phoneNumber: '+1 (555) 123-4567',
          email: 'john.doe@example.com',
          role: 'user'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountInfo();

  }, [user, token]);

  return (
    <div className="account-info-container">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="account-details">
          <h1>Account Information</h1>
          <p><strong>ID:</strong> {accountData?.id}</p>
          <p><strong>First Name:</strong> {accountData?.firstName}</p>
          <p><strong>Last Name:</strong> {accountData?.lastName}</p>
          <p><strong>User Name:</strong> {accountData?.userName}</p>
          <p><strong>Phone Number:</strong> {accountData?.phoneNumber}</p>
          <p><strong>Email:</strong> {accountData?.email}</p>
          <p><strong>Role:</strong> {accountData?.role}</p>
        </div>
      )}
    </div>
  );
};

export default Account;
