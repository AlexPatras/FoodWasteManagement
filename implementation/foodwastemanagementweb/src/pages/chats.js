import React, { useState, useEffect } from "react";
import "./style/chats.css";
import { useAuth } from "..//authentication/AuthContext";

const Chats = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch("your_api_endpoint");
      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      const chatsSample = [
        { id: 1, name: "Chat 1", lastMessage: "Last message in chat 1" },
        { id: 2, name: "Chat 2", lastMessage: "Last message in chat 2" },
      ];
      setChats(chatsSample);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    setLoading(true);
    try {
      const response = await fetch(`your_api_endpoint/${chatId}`);
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (chatId === 1) {
        const fakeMessages = [
          { sender: "Me", content: "hey this is your chat wahoo!hey this is your chat wahoo!hey this is your chat wahoo!hey this is your chat wahoo!hey this is your chat wahoo!hey this is your chat wahoo!hey this is your chat wahoo!hey this is your chat wahoo!hey this is your chat wahoo!hey this is your chat wahoo!", timestamp: new Date().toISOString() },
          { sender: "Admin", content: "chat 1 here :D", timestamp: new Date().toISOString() },
        ];
        setMessages(fakeMessages);
      } else {
        const fakeMessages = [
          { sender: "Me", content: "um i am not logged in", timestamp: new Date().toISOString() },
          { sender: "Admin", content: "no shit sherlock", timestamp: new Date().toISOString() },
        ];
        setMessages(fakeMessages);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chatId) => {
    setSelectedChat(chatId);
    fetchMessages(chatId);
  };

  const sendMessage = async () => {
    if (!user) {
      alert("Please log in to access this feature.");
      return;
    }

    if (messageInput.trim() === "") return;

    try {
      const newMessage = {
        sender: user.username,
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
      };
      const response = await fetch("your_api_endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat,
          message: newMessage,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      setMessages([...messages, newMessage]);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery === "") {
      setSearchResult(null);
    } else {
      try {
        setLoading(true);
        const response = await fetch(`your_search_endpoint?query=${searchQuery}`);
        const data = await response.json();
        setSearchResult(data.user);
      } catch (error) {
        console.error("Error searching users:", error);
        const fakeUserData = {
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com",
        };
        setSearchResult(fakeUserData);
      } finally {
        setLoading(false);
      }
    }
  };

  const addUserToChat = async () => {
    try {
      // Add logic to add the user to the list of chats
      // Update the state accordingly
    } catch (error) {
      console.error("Error adding user to chat:", error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat !== null) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  return (
    <div className="chats-container">
      <div className="mobile-menu-toggle" onClick={() => setMenuVisible(!menuVisible)}>
        <button>{menuVisible ? "Close chat Menu" : "Open chat Menu"}</button>
      </div>

      <div className={`chats-list ${menuVisible ? 'visible' : ''}`}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users"
        />
        <button onClick={handleSearch}>Search</button>
        {searchResult && (
          <div className="search-result">
            <h3>{searchResult.name}</h3>
            <button onClick={addUserToChat}>Add to Chat</button>
          </div>
        )}
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="chat-item"
            onClick={() => handleChatClick(chat.id)}
          >
            <div className="chat-info">
              <h3>{chat.name}</h3>
              <p>{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={`chat-content ${menuVisible ? 'menu-visible' : ''}`}>
        {loading ? (
          <div>Loading messages...</div>
        ) : (
          <>
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className="message">
                  <div className="message-sender">{message.sender}</div>
                  <div className="message-content">{message.content}</div>
                  <div className="message-timestamp">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chats;
