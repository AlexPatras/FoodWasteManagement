import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/style/Donate.css'; // Import your CSS file for styling


const Donate = () => {
  const [donationType, setDonationType] = useState('money');
  const [currency, setCurrency] = useState('USD');
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [foodImage, setFoodImage] = useState(null);
  const [foodQuantity, setFoodQuantity] = useState('');
  const [foodUnit, setFoodUnit] = useState('grams');
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState('');
  const token = localStorage.getItem('token');              
  const id = localStorage.getItem('id');

  

  useEffect(() => {
    // Fetch list of friends from the API when the component mounts
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await axios.get('your_api_endpoint/friends');
      setFriends(response.data.friends + { id: 1, name: "Random" }); // Assuming friends are returned in the "friends" field
    } catch (error) {
      console.error('Error fetching friends:', error);
      const friends = [
        { id: 1, name: "Random" },
        { id: 2, name: "Jane Smith" },
        { id: 3, name: "Alice Johnson" },
      ];
      setFriends(friends);
    }
  };

  const handleDonation = async () => {
    try {
      let data = {
        donatorId: parseFloat(id),
      };
  
      let apiEndpoint = '';
  
      if (donationType === 'money') {
        data.amount = parseFloat(donationAmount);
        data.currency = currency;
        apiEndpoint = 'http://[::1]:3000/monies';
      } else {
        data.image = foodImage;
        data.quantity = foodQuantity;
        data.unit = foodUnit;
        data.message = donationMessage;
        data.recipient = selectedFriend;
        apiEndpoint = 'http://[::1]:3000/foodDonation';
      }
  
      const response = await axios.post(apiEndpoint, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
  
      console.log(response.data); // Log the response from the API
      alert("Successfully made a donation :)");
    } catch (error) {
      console.error('Error submitting donation:', error);
      alert("Error with the API :(");
      // Handle error, show error message to user, etc.
    }
  };
  

  return (
    <div className="donate-donation-container">
      <div className="donate-donation-box">
        <h2>Donate Food/Money</h2>
        <div>
          <label>
            Money
            <input
              type="radio"
              value="money"
              checked={donationType === 'money'}
              onChange={() => setDonationType('money')}
            />
          </label>
          <label>
            Food
            <input
              type="radio"
              value="food"
              checked={donationType === 'food'}
              onChange={() => setDonationType('food')}
            />
          </label>
        </div>
        {donationType === 'money' ? (
          <div>
            <input
              type="text"
              placeholder="Enter amount"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
            />
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              {/* Add more currency options as needed */}
            </select>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoodImage(e.target.files[0])}
            />
            <input
              type="text"
              placeholder="Enter quantity"
              value={foodQuantity}
              onChange={(e) => setFoodQuantity(e.target.value)}
            />
            <select value={foodUnit} onChange={(e) => setFoodUnit(e.target.value)}>
              <option value="grams">grams</option>
              <option value="milliliters">milliliters</option>
              {/* Add more unit options as needed */}
            </select>
            <textarea
              placeholder="Leave a message (optional)"
              value={donationMessage}
              onChange={(e) => setDonationMessage(e.target.value)}
            ></textarea>
            <select value={selectedFriend} onChange={(e) => setSelectedFriend(e.target.value)}>
              <option value="">Select friend</option>
              {friends.map((friend) => (
                <option key={friend.id} value={friend.id}>
                  {friend.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button onClick={handleDonation}>Donate</button>
      </div>
    </div>
  );
};

export default Donate;
