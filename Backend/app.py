import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS 
from financials import get_price, get_historical_data
app = Flask(__name__)
CORS(app)

# Create the database and table if they don't exist
def init_db():
    connection = sqlite3.connect('stocks.db')
    cursor = connection.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    connection.commit()
    connection.close()

# Function to get posts for a specific ticker
def get_posts(ticker):
    connection = sqlite3.connect('stocks.db')
    cursor = connection.cursor()
    cursor.execute("SELECT content, created_at FROM posts WHERE ticker = ?", (ticker,))
    posts = cursor.fetchall()
    connection.close()
    return [{"content": post[0], "created_at": post[1]} for post in posts]

# Function to add a new post
def add_post(ticker, content):
    connection = sqlite3.connect('stocks.db')
    cursor = connection.cursor()
    cursor.execute("INSERT INTO posts (ticker, content) VALUES (?, ?)", (ticker, content))
    connection.commit()
    connection.close()
    return {"ticker": ticker, "content": content}

# API route to get stock data (for simplicity, we're just sending dummy stock price data here)
@app.route('/stock/<ticker>', methods=['GET'])
def get_stock_data(ticker):
    try:
        stock_price = get_price(ticker)
        historical_data = get_historical_data(ticker, period="5y")  # Fetch 5 years of data

        return jsonify({
            "stock_price": stock_price,
            "historical_data": historical_data,
            "posts": []  # Placeholder for discussion posts
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API route to add a new post to a stock ticker
@app.route('/api/post', methods=['POST'])
def post_comment():
    data = request.get_json()

    # Log the incoming request data to verify
    print(f"Received POST data: {data}")

    ticker = data.get('ticker')
    content = data.get('content')

    if not ticker or not content:
        return jsonify({"error": "Ticker and content are required"}), 400

    # Log that we're adding the post
    print(f"Adding post for ticker: {ticker} with content: {content}")

    post = add_post(ticker, content)
    response = jsonify({"post": post})
           
    # Log the response before sending it
    print(f"Returning response: {response.get_data(as_text=True)}")
    
    return response, 201
    


if __name__ == '__main__':
    init_db()  # Ensure the database and table are created when the app starts
    app.run(debug=True)



