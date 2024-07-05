import React, { useState, useEffect } from 'react';
import '../pages/style/Community.css'; // Import CSS file for styling

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    // Fetch posts from the API when the component mounts
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('your_api_endpoint');
      const data = await response.json();
      setPosts(data.posts); // Assuming posts are returned in the "posts" field
    } catch (error) {
      console.error('Error fetching posts:', error);
      // If an error occurs, provide some fake posts for display
      const fakePosts = [
        { id: 1, content: "Fake post 1", author: "Admin", timestamp: new Date().toLocaleString(), likes: 0, dislikes: 0 },
        { id: 2, content: "Fake post 2", author: "Admin", timestamp: new Date().toLocaleString(), likes: 0, dislikes: 0 },
        // Add more fake posts as needed
      ];
      setPosts(fakePosts);
    }
  };

  const handlePostChange = (e) => {
    setNewPostContent(e.target.value);
  };

  const handlePostSubmit = async () => {
    if (newPostContent.trim() === '') {
      return; // Don't allow empty posts
    }

    try {
      const response = await fetch('your_api_endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newPostContent }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit post');
      }
      const data = await response.json();
      setPosts([data.post, ...posts]); 
      setNewPostContent('');
    } catch (error) {
      console.error('Error submitting post:', error);
      alert("you are not logged in!");
    }
  };

  const handleLike = async (postId) => {
    // Implement logic to update likes on the server
  };

  const handleDislike = async (postId) => {
    // Implement logic to update dislikes on the server
  };

  return (
    <div className="community-page">
      <h1>Community Page</h1>
      <div className="post-form">
        <textarea
          rows="4"
          cols="50"
          value={newPostContent}
          onChange={handlePostChange}
          placeholder="Write your post here..."
        />
        <button onClick={handlePostSubmit}>Post</button>
      </div>
      <div className="post-list">
        {posts.map((post) => (
          <div className="post" key={post.id}>
            <p className="post-content">{post.content}</p>
            <p className="post-author">Posted by {post.author} on {post.timestamp}</p>
            <div className="post-actions">
              <button className="like-btn" onClick={() => handleLike(post.id)}>Like</button>
              <button className="dislike-btn" onClick={() => handleDislike(post.id)}>Dislike</button>
              <span>{post.likes} Likes</span>
              <span>{post.dislikes} Dislikes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
