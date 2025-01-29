import React, { useState, useEffect } from 'react';

// StockPage Component (discussion thread for a specific ticker)
function StockPage({ ticker }) {
  const [stockPrice, setStockPrice] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStockData() {
      setLoading(true);
      try {
        // Fetch stock price and posts for the ticker
        const stockResponse = await fetch(`http://localhost:5000/stock/${ticker}`); // Updated URL to Flask backend
        const stockData = await stockResponse.json();
        setStockPrice(stockData.stock_price);
        setPosts(stockData.posts);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStockData();
  }, [ticker]);

  const handlePostSubmit = () => {
    const post = { ticker, content: newPost };

    // Debugging: log the data being sent to the backend
    console.log("Submitting post:", post);

    fetch('http://localhost:5000/api/post', {  // Updated URL to Flask backend
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    })
      .then((response) => {
        console.log("Response status:", response.status); // Log the response status

        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to post comment');
        }
      })
      .then((data) => {
        console.log("Received response:", data);  // Log the response data
        if (data.post) {
          setPosts([...posts, data.post]);  // Add the new post to the state
          setNewPost('');  // Clear the input field
        } else {
          console.error("Failed to post:", data.error);
        }
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
      });
  };

  return (
    <div className="stock-page">
      <h1>{ticker} Stock Discussion</h1>

      {loading ? (
        <p>Loading stock data...</p>
      ) : (
        <div>
          <h2>Price: ${stockPrice}</h2>
          <div>
            <h3>Discussion</h3>
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div key={index} className="post">
                  <p>{post.content}</p>
                  <small>{new Date(post.created_at).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <p>No posts yet. Be the first to start a discussion!</p>
            )}
          </div>

          <div className="new-post">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Add a comment..."
            ></textarea>
            <button onClick={handlePostSubmit}>Post Comment</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Home Component (Search bar to look up stock ticker)
function Home() {
  const [ticker, setTicker] = useState('');
  const [selectedTicker, setSelectedTicker] = useState(null);

  const handleSearch = () => {
    if (ticker) {
      // Set the selected ticker to the searched value
      setSelectedTicker(ticker.toUpperCase());
    }
  };

  return (
    <div className="home">
      <h1>Welcome to Stock Discussion</h1>

      <div>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter Stock Ticker"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {selectedTicker && <StockPage ticker={selectedTicker} />}
    </div>
  );
}

export default Home;
