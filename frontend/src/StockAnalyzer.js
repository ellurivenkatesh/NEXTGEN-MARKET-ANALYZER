import React, { useState, useMemo, useRef, useEffect } from "react";
import stockImage from "./assets/STOCKANALYZERIMAGE.png";
import "./StockAnalyzer.css";

// Generate STK001 - STK100 dynamically
const stockSymbols = Array.from({ length: 100 }, (_, i) =>
  `STK${String(i + 1).padStart(3, "0")}`
);

function StockEvaluator() {
  const [selectedStock, setSelectedStock] = useState("");
  const [evaluationType, setEvaluationType] = useState("fundamental");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const filteredStocks = useMemo(() => {
    if (!searchQuery) return stockSymbols;
    return stockSymbols.filter((s) =>
      s.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSelect = (sym) => {
    setSelectedStock(sym);
    setSearchQuery(sym);
    setShowDropdown(false);
  };

  const handleEvaluate = () => {
    if (!selectedStock) {
      alert("Please select a stock!");
      return;
    }

    if (evaluationType === "fundamental") {
      // Open fundamental analysis in same page or fetch API as needed
      alert(`Fetch fundamental analysis for ${selectedStock}`);
    } else if (evaluationType === "llm") {
      // Open external quantitative analysis page in new tab
      window.open("https://market-analyze.onrender.com/", "_blank");
    }
  };

  return (
    <div className="stock-container">
      <div className="main-content">
        <div className="left-half">
          <img src={stockImage} alt="Stock Visual" className="stock-image" />
        </div>

        <div className="right-half">
          <div className="center-content-right">
            <div className="search-container" ref={searchRef}>
              <div className="search-label">Select Stock</div>
              <input
                type="text"
                placeholder="Search stock..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="stock-search-input"
              />
              {showDropdown && filteredStocks.length > 0 && (
                <ul className="stock-dropdown">
                  {filteredStocks.map((sym) => (
                    <li key={sym} onClick={() => handleSearchSelect(sym)}>
                      {sym}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="evaluation-dropdown-container">
              <label htmlFor="evaluation-type" className="search-label">
                Choose Analyzer
              </label>
              <select
                id="evaluation-type"
                className="evaluation-dropdown"
                value={evaluationType}
                onChange={(e) => setEvaluationType(e.target.value)}
              >
                <option value="fundamental">Fundamental Analysis</option>
                <option value="llm">Quantitative Analysis (AI)</option>
              </select>
            </div>

            <button className="evaluate-btn" onClick={handleEvaluate}>
              Evaluate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockEvaluator;
