import yfinance as yf

def get_price(ticker):
    stock = yf.Ticker(ticker)
    info = stock.fast_info
    actual_price = round(info.last_price, 2)
    
    return actual_price
