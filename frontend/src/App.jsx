import React, { useState } from 'react';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert('請先輸入名字');
      return;
    }

    const randomCode = `MZ-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomPercentage = Math.floor(Math.random() * 101);
    const statusOptions = ['審核中', '已完成'];
    const randomStatus =
      statusOptions[Math.floor(Math.random() * statusOptions.length)];

    setResult({
      name: searchTerm,
      code: randomCode,
      percentage: randomPercentage,
      status: randomStatus,
    });
  };

  return (
    <div className="container">
      <h1 className="title">進度查詢系統</h1>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="請輸入姓名..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-button" onClick={handleSearch}>
          搜尋
        </button>
      </div>

      {result && (
        <div className="result-card">
          <h2>查詢結果</h2>
          <div className="result-item">
            <span className="label">查詢姓名：</span>
            <span className="value">{result.name}</span>
          </div>
          <div className="result-item">
            <span className="label">案件代號：</span>
            <span className="value">{result.code}</span>
          </div>
          <div className="result-item">
            <span className="label">當前狀態：</span>
            <span className={`status-badge status-${result.status}`}>
              {result.status}
            </span>
          </div>
          <div className="result-item">
            <span className="label">處理進度：</span>
            <div className="progress-wrapper">
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
              <span className="progress-text">{result.percentage}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;