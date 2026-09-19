import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../App';

function ApplyPage() {
    const [application, setApplication] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const lineUserId = new URLSearchParams(window.location.search).get('line_user_id');

        if (!lineUserId) {
            setErrorMessage('缺少 LINE 帳號資訊，請從 LINE 的一鍵申請重新進入。');
            return;
        }

        axios.get(`${BACKEND_URL}/api/applications/by-line/${encodeURIComponent(lineUserId)}`)
            .then((response) => setApplication(response.data))
            .catch((error) => {
                setErrorMessage(
                    error.response?.data?.error || '目前無法取得案件資料，請稍後再試。',
                );
            });
    }, []);

    if (errorMessage) {
        return <main className="simple-page"><h1>申請資料</h1><p>{errorMessage}</p></main>;
    }

    if (!application) {
        return <main className="simple-page"><h1>申請資料</h1><p>資料讀取中...</p></main>;
    }

    return (
        <main className="simple-page">
            <p className="eyebrow">ONLINE APPLICATION</p>
            <h1>確認申請資料</h1>
            <p>姓名：{application.name}</p>
            <p>案件編號：{application.application_id}</p>
            <p>身分證末四碼：{application.id_last4}</p>
            <p>出生年月日：{application.birthday_roc}</p>
            <p>目前狀態：{application.status}</p>
        </main>
    );
}

export default ApplyPage;