import React, { useState } from 'react';
import './SearchPage.css';

function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setErrorMessage('請先輸入姓名');
            setResult(null);
            return;
        }

        // 開始搜尋：顯示載入狀態、清空錯誤與舊結果
        setIsLoading(true);
        setErrorMessage('');
        setResult(null);

        try {
            // 呼叫 Flask 後端 API (預設跑在 5000 port)
            const response = await fetch(`http://127.0.0.1:5000/applications?name=${encodeURIComponent(searchTerm.trim())}`);
            const data = await response.json();

            // 如果後端回傳 400, 404, 500 等錯誤，拋出錯誤讓 catch 捕捉
            if (!response.ok) {
                throw new Error(data.error || '查詢失敗，請稍後再試');
            }

            // 成功取得資料，設定結果 (這裡的 data key 已經在後端對齊)
            setResult({
                name: data.name,
                code: data.code,
                percentage: data.percentage,
                status: data.status,
            });

        } catch (error) {
            // 將後端回傳的錯誤訊息顯示在畫面上
            setErrorMessage(error.message);
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