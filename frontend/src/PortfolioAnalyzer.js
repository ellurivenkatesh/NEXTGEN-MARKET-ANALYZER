import React, { useState, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import portfolioImage from './assets/PORTFOLIOIMAGE.png';
import './PortfolioAnalyzer.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const clientIDs = ['C101','C102','C103','C104','C105','C106','C107','C108','C109','C110'];

function PortfolioAnalyzer() {
    const [clientId, setClientId] = useState('');
    const [data, setData] = useState(null);
    const [overlapData, setOverlapData] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    const filteredClientIDs = useMemo(() => {
        if (!searchQuery) return clientIDs;
        return clientIDs.filter(id =>
            id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSelect = (id) => {
        setClientId(id);
        setSearchQuery(id);
        setShowDropdown(false);
    };

    const handleSubmit = async () => {
        if (!clientId) {
            alert('Please select a client ID');
            return;
        }
        try {
            const portfolioRes = await axios.get(`http://localhost:3000/api/portfolio/${clientId}`);
            setData(portfolioRes.data);

            const overlapRes = await axios.get(`http://localhost:3000/api/overlap/${clientId}`);
            setOverlapData(overlapRes.data);

            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
        } catch (err) {
            console.error(err);
            alert('Error fetching data');
        }
    };

    const pieData = data ? {
        labels: Object.keys(data.portfolioAnalysis.sectorDiversification),
        datasets: [{
            data: Object.values(data.portfolioAnalysis.sectorDiversification),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        }],
    } : null;

    const combinedScore = data && overlapData
        ? +((data.portfolioAnalysis.sectorScore * 0.5) + (overlapData.overlap_score * 0.5)).toFixed(2)
        : null;

    const suggestions = data ? [
        data.portfolioAnalysis.sectorScore < 50 ? 'Consider diversifying into tech sector' : 'Sector allocation looks good',
        overlapData && overlapData.overlap_score > 50 ? 'Reduce fund overlaps for better returns' : 'Fund overlap is minimal',
    ] : [];

    const combinedScoreData = combinedScore ? {
        labels: ['Score', 'Remaining'],
        datasets: [{
            data: [combinedScore, 100 - combinedScore],
            backgroundColor: ['#00bcd4', 'rgba(255,255,255,0.1)'],
            borderWidth: 0
        }],
    } : null;

    return (
        <div className="portfolio-container">
            <div className="main-content">
                <div className="left-half">
                    <img src={portfolioImage} alt="Portfolio Visual" className="portfolio-image" />
                </div>

                <div className="right-half">
                    <div className="top-search-analyze">
                        <div className="search-container" ref={searchRef}>
                            <div className="search-label">Select Client ID</div>
                            <input
                                type="text"
                                placeholder="Search client ID..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                                onFocus={() => setShowDropdown(true)}
                                className="client-search-input"
                            />
                            {showDropdown && filteredClientIDs.length > 0 && (
                                <ul className="client-dropdown">
                                    {filteredClientIDs.map((id) => (
                                        <li key={id} onClick={() => handleSearchSelect(id)}>{id}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button className="analyze-btn" onClick={handleSubmit}>Analyze</button>
                    </div>

                    {data && (
                        <div className="suggestions-section-right">
                            <h3>Suggestions</h3>
                            <ul>
                                {suggestions.map((sug, idx) => <li key={idx}>{sug}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {data && overlapData && (
                <div className="analysis-section">
                    <div className="left-half-analysis">
                        <h3>Sector Diversification</h3>
                        <div className="pie-chart-container">
                            <Pie data={pieData} />
                        </div>
                        <p className="score-text">Sector Score: <strong>{data.portfolioAnalysis.sectorScore}</strong></p>
                        <p className="summary-text">{data.summary}</p>
                    </div>

                    <div className="right-half-analysis">
                        <h3>Fund Overlap</h3>
                        <div className="overlap-bars">
                            {overlapData.pairs.map((pair, idx) => (
                                <div className="bar-container" key={idx}>
                                    <span>{pair.fund_i} ↔ {pair.fund_j}</span>
                                    <div className="bar">
                                        <div className="bar-fill" style={{ width: `${pair.overlap_pct}%` }}>
                                            {pair.overlap_pct}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="score-text">Overlap Score: <strong>{overlapData.overlap_score}</strong></p>

                        {combinedScoreData && (
                            <div className="combined-score-container">
                                <h3>Diversified Score</h3>
                                <div className="doughnut-chart-wrapper">
                                    <Doughnut data={combinedScoreData} options={{
                                        rotation: -90,
                                        circumference: 180,
                                        plugins: { legend: { display: false } },
                                    }} />
                                    <div className="score-text-center">{combinedScore}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PortfolioAnalyzer;