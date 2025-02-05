import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

function StockPage({ ticker }) {
  const [stockPrice, setStockPrice] = useState(null);
  const [posts, setPosts] = useState([]);
  const [historicalData, setHistoricalData] = useState([]); // Ensure it's initialized as an empty array
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("5y"); // Default time frame

  useEffect(() => {
    async function fetchStockData() {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/stock/${ticker}`);
        const data = await response.json();
        setStockPrice(data.stock_price);
        setPosts(data.posts || []); // Ensure posts is always an array
        setHistoricalData(data.historical_data || []); // Ensure historicalData is always an array
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

    fetch('http://localhost:5000/api/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Failed to post comment');
      })
      .then((data) => {
        if (data.post) {
          setPosts([...posts, data.post]);
          setNewPost('');
        } else {
          console.error("Failed to post:", data.error);
        }
      })
      .catch((error) => console.error("Error posting comment:", error));
  };

  // Filter historical data based on time frame selection
  const filteredData = historicalData.length > 0 ? historicalData.filter((entry) => {
    const date = new Date(entry.Date);
    const now = new Date();
    switch (timeFrame) {
      case "1d":
        return date >= new Date(now.setDate(now.getDate() - 1));
      case "1w":
        return date >= new Date(now.setDate(now.getDate() - 7));
      case "ytd":
        return date.getFullYear() === new Date().getFullYear();
      case "1y":
        return date >= new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return true; // 5y (default)
    }
  }) : [];

  return (
    <div className="stock-page">
      <h1>{ticker} Stock Discussion</h1>
      {loading ? (
        <p>Loading stock data...</p>
      ) : (
        <div>
          <h2>Price: ${stockPrice}</h2>

          {/* Time Frame Selection */}
          <div>
            <button onClick={() => setTimeFrame("1d")}>1D</button>
            <button onClick={() => setTimeFrame("1w")}>1W</button>
            <button onClick={() => setTimeFrame("ytd")}>YTD</button>
            <button onClick={() => setTimeFrame("1y")}>1Y</button>
            <button onClick={() => setTimeFrame("5y")}>5Y</button>
          </div>

          {/* Stock Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="Close"
                stroke={filteredData.length > 1 && filteredData[0].Close < filteredData[filteredData.length - 1].Close ? "green" : "red"}
                dot={false} // Removes the white circles
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Discussion Section */}
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

          {/* New Post Section */}
          <div className="new-post">
            <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Add a comment..."></textarea>
            <button onClick={handlePostSubmit}>Post Comment</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockPage;