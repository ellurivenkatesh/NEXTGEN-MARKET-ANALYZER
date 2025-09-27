import React, { useState } from 'react';
import PortfolioAnalyzer from './PortfolioAnalyzer.js';
import StockAnalyzer from './StockAnalyzer.js';
import './App.css';
import heroImage from './assets/portfolio-intelligent.jpg'; // import image

function App() {
  const [page, setPage] = useState('home');

  return (
    <div className="app-container">
      <nav>
        {/* Always show Home button in nav */}
        {page !== 'home' && <button onClick={() => setPage('home')}>Home</button>}
      </nav>

      <main>
        {page === 'home' && (
          <div className="home">
            <img
              src={heroImage}
              alt="Portfolio Intelligence"
              className="hero-image"
            />
            <div className="home-buttons">
              <button onClick={() => setPage('portfolio')}>Portfolio Analyzer</button>
              <button onClick={() => setPage('stock')}>Stock Analyzer</button>
            </div>
          </div>
        )}
        {page === 'portfolio' && <PortfolioAnalyzer />}
        {page === 'stock' && <StockAnalyzer />}
      </main>
    </div>
  );
}

export default App;
