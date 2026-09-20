import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../../App';
import './SearchPage.css';

function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('陳小美');
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 核心搜尋邏輯
    const handleSearch = async (overrideName) => {
        const queryName = (overrideName !== undefined ? overrideName : searchTerm).trim();

        if (!queryName) {
            setErrorMessage('請先輸入申請人姓名');
            setResult(null);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch(
                `${BACKEND_URL}/applications?name=${encodeURIComponent(queryName)}`,
                {
                    headers: { 'ngrok-skip-browser-warning': 'true' },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '查無此姓名之申辦案件');
            }

            setResult({
                name: data.name,
                code: data.code,
                percentage: data.percentage ?? 0,
                status: data.status || '處理中',
                submitted_at: data.submitted_at || '2026-08-15 10:00:00',
                updated_at: data.updated_at || '2026-08-25 10:00:00',
                expected_completed_at: data.expected_completed_at || '2026-09-22 10:00:00',
            });
        } catch (error) {
            // 提供「陳小美」之 Mock 兜底機制，確保在任何離線或展示環境下皆能正常呈現資料
            if (queryName === '陳小美') {
                setResult({
                    name: '陳小美',
                    code: 'AI20260001',
                    percentage: 65,
                    status: '資料審核中',
                    submitted_at: '2026-08-15 10:00:00',
                    updated_at: '2026-08-25 10:00:00',
                    expected_completed_at: '2026-09-22 10:00:00',
                });
                setErrorMessage('');
            } else {
                setResult(null);
                setErrorMessage(error.message || '查詢失敗，請稍後再試');
            }
        } finally {
            setIsLoading(false);
        }
    };


    // 一進入頁面預設模擬帶入「陳小美」並查詢
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const nameParam = searchParams.get('name');
        const initialName = nameParam ? nameParam.trim() : '陳小美';

        setSearchTerm(initialName);
        handleSearch(initialName);
    }, []);

    // 轉換民國年日期顯示格式
    const formatROCDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const d = new Date(dateStr.replace(' ', 'T'));
            if (isNaN(d.getTime())) return dateStr;
            const rocYear = d.getFullYear() - 1911;
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${rocYear}年${month}月${day}日 ${hours}:${minutes}`;
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <main className="apply-container search-container">
            {/* 提示徽章 */}
            <div className="apply-source-badge">
                <span>📋</span>
                <span>新竹市青年數位工具補助 — 案件進度查詢系統</span>
            </div>

            <div className="search-header-area">
                <h1 className="search-page-title">案件進度查詢</h1>
                <p className="search-page-subtitle">
                    輸入申請人姓名即可即時調閱補助案件審核進度、處理狀態與撥款期程。
                </p>
            </div>

            {/* 搜尋列 */}
            <div className="search-control-panel">
                <div className="search-bar-modern">
                    <input
                        type="text"
                        className="search-input-modern"
                        placeholder="請輸入申請人姓名（例如：陳小美）..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        type="button"
                        className="btn-search-primary"
                        onClick={() => handleSearch()}
                        disabled={isLoading}
                    >
                        {isLoading ? '查詢中…' : '🔍 搜尋案件'}
                    </button>
                </div>
            </div>

            {/* 錯誤訊息 */}
            {errorMessage && (
                <div className="search-error-alert" role="alert">
                    ⚠️ {errorMessage}
                </div>
            )}

            {/* 查詢結果：第一部分申請人摘要 + 第二部分依參考圖呈現之申請進度 */}
            {result && (
                <div className="search-result-section">
                    {/* 一、申請人與案件摘要 表格 */}
                    <table className="gov-form-table">
                        <thead>
                            <tr className="section-header-row">
                                <th colSpan={4} className="section-title">
                                    一、申請人與案件摘要
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="cell-label">申請人姓名</td>
                                <td className="cell-content bold-text">{result.name}</td>
                                <td className="cell-label">案件編號</td>
                                <td className="cell-content highlight-code">{result.code}</td>
                            </tr>
                            <tr>
                                <td className="cell-label">申辦項目</td>
                                <td className="cell-content">
                                    新竹市青年數位工具補助 — ChatGPT Plus 訂閱
                                </td>
                                <td className="cell-label">申請對象</td>
                                <td className="cell-content">一般青年 (設籍新竹市)</td>
                            </tr>
                            <tr>
                                <td className="cell-label">當前狀態</td>
                                <td className="cell-content">
                                    <span className={`status-tag status-${result.status}`}>
                                        ● {result.status}
                                    </span>
                                </td>
                                <td className="cell-label">核定補助款</td>
                                <td className="cell-content bold-text price-text">NT$ 651</td>
                            </tr>
                            <tr>
                                <td className="cell-label">審核進度</td>
                                <td colSpan={3} className="cell-content">
                                    <div className="table-progress-box">
                                        <div className="table-progress-track">
                                            <div
                                                className="table-progress-bar"
                                                style={{ width: `${result.percentage}%` }}
                                            />
                                        </div>
                                        <span className="table-progress-label">
                                            {result.percentage}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* 二、案件處理進度與時程預估 表格 */}
                    <table className="gov-form-table">
                        <thead>
                            <tr className="section-header-row">
                                <th colSpan={4} className="section-title">
                                    二、案件處理進度與時程預估
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="cell-label">目前階段</td>
                                <td className="cell-content bold-text">
                                    <span className="status-tag status-資料審核中">
                                        ● 資料審核
                                    </span>
                                </td>
                                <td className="cell-label">前方待審案件</td>
                                <td className="cell-content">
                                    <span className="queue-count-highlight">12</span> 件
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">AI 預估完成時間</td>
                                <td className="cell-content bold-text" style={{ color: '#1a365d' }}>
                                    約 2 個工作天
                                </td>
                                <td className="cell-label">預計完成日期</td>
                                <td className="cell-content bold-text">
                                    9/22 <span style={{ fontSize: '0.88rem', color: '#666', fontWeight: 'normal' }}>(民國115年9月22日)</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">送件日期</td>
                                <td className="cell-content">
                                    {formatROCDate(result.submitted_at)}
                                </td>
                                <td className="cell-label">最近更新</td>
                                <td className="cell-content">
                                    {formatROCDate(result.updated_at)}
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">申請進度</td>
                                <td colSpan={3} className="cell-content">
                                    {/* 5 階段審核時程進度條 */}
                                    <div className="flow-stepper">
                                        <div className="flow-step done">
                                            <div className="step-circle">✓</div>
                                            <div className="step-title">申請資料送出</div>
                                            <div className="step-desc">已送出登錄</div>
                                        </div>
                                        <div className="step-line active"></div>
                                        <div className="flow-step done">
                                            <div className="step-circle">✓</div>
                                            <div className="step-title">資料完整性檢查</div>
                                            <div className="step-desc">檢核通過</div>
                                        </div>
                                        <div className="step-line active"></div>
                                        <div className="flow-step current">
                                            <div className="step-circle">3</div>
                                            <div className="step-title">資格 / 資料審核中</div>
                                            <div className="step-desc">目前進行中</div>
                                        </div>
                                        <div className="step-line"></div>
                                        <div className="flow-step pending">
                                            <div className="step-circle">4</div>
                                            <div className="step-title">經費核銷</div>
                                            <div className="step-desc">發票核銷</div>
                                        </div>
                                        <div className="step-line"></div>
                                        <div className="flow-step pending">
                                            <div className="step-circle">5</div>
                                            <div className="step-title">撥款完成</div>
                                            <div className="step-desc">撥入指定帳戶</div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* 底部功能按鈕 */}
                    <div className="search-actions-bar">
                        <button
                            type="button"
                            className="btn-action-outline"
                            onClick={() => {
                                setSearchTerm('');
                                setResult(null);
                            }}
                        >
                            重新輸入查詢
                        </button>
                        <Link to="/apply" className="btn-action-primary">
                            前往線上案件申報 →
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}

export default SearchPage;