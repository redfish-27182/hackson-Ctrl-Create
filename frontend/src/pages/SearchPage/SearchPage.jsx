import React, { useState } from 'react';
import './SearchPage.css';

function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setErrorMessage('請先輸入姓名');
            setResult(null);
            return;
        }

        // 開始搜尋：顯示載入狀態、清空錯誤與舊結果
        setIsLoading(true);
        setErrorMessage('');
        setResult(null);

        // 使用 setTimeout 模擬黑客松 Demo 時的網路延遲 (1.5秒)
        setTimeout(() => {
            // 隨機生成假的案件資料
            const fakeId = 'CASE' + Math.floor(100000 + Math.random() * 900000); // 隨機6位數代號
            const statusOptions = ['審核中', '已完成', '補件中'];
            const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
            const randomPercentage = Math.floor(Math.random() * 101); // 0 到 100 隨機進度

            // 設定查詢結果
            setResult({
                name: searchTerm.trim(),
                code: fakeId,
                percentage: randomPercentage,
                status: randomStatus,
            });

            setIsLoading(false);
        }, 1500); // 1.5 秒後顯示結果
    };

    return (
        <main className="search-page">
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
                <button className="search-button" onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? '查詢中…' : '搜尋'}
                </button>
            </div>

            {errorMessage && <p className="search-error" role="alert">{errorMessage}</p>}

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
        </main>
    );
}

export default SearchPage;