import yfinance as yf
import pandas as pd

def get_price(ticker):
    stock = yf.Ticker(ticker)
    info = stock.fast_info
    actual_price = round(info["last_price"], 2)
    return actual_price

def get_historical_data(ticker, period="5y"):
    stock = yf.Ticker(ticker)
    
    # Fetch historical data from Yahoo Finance
    history = stock.history(period=period)

    if history.empty:
        return []

    # Reset index to get Date as a column and convert to string
    history.reset_index(inplace=True)
    history["Date"] = history["Date"].dt.strftime("%Y-%m-%d")

    # Return only Date and Close price
    historical_data = history[["Date", "Close"]].to_dict(orient="records")
    
    return historical_data

