import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../App';
import './searchPage.css';

function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setErrorMessage('請先輸入名字');
            setResult(null);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setResult(null);

        try {
            const response = await axios.get(`${BACKEND_URL}/applications`, {
                params: { name: searchTerm.trim() },
            });

            const { name, ID } = response.data;

            if (!name || !ID) {
                throw new Error('後端回傳資料格式不正確');
            }

            // 狀態與進度依需求維持前端虛擬資料。
            const randomPercentage = Math.floor(Math.random() * 101);
            const statusOptions = ['審核中', '已完成'];
            const randomStatus =
            statusOptions[Math.floor(Math.random() * statusOptions.length)];

            setResult({
                name,
                code: ID,
                percentage: randomPercentage,
                status: randomStatus,
            });
        } catch (error) {
            setErrorMessage(
                error.response?.status === 404
                    ? '找不到此姓名的案件資料'
                    : error.message || '目前無法取得案件資料，請稍後再試。',
            );
        } finally {
            setIsLoading(false);
        }
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
