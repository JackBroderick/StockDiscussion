import React, { useState } from "react";
import StockPage from "./StockPage";

function Home() {
  const [ticker, setTicker] = useState("");
  const [selectedTicker, setSelectedTicker] = useState(null);

  const handleSearch = () => {
    if (ticker.trim()) {
      setSelectedTicker(ticker.toUpperCase());
    }
  };

  return (
    <div className="home">
      <h1>Stock Market Discussion</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter Stock Ticker (e.g., AAPL, TSLA)"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Show StockPage when a ticker is selected */}
      {selectedTicker && <StockPage ticker={selectedTicker} />}
    </div>
  );
}

export default Home;
