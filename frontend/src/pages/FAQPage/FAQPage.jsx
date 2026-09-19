import { useState } from 'react';
import './FAQPage.css';

const faqItems = [
    {
        question: '如何開始線上申辦？',
        answer: '請先選擇欲申辦的服務，依頁面指示登入並填寫資料；確認內容無誤後即可送出申請。',
    },
    {
        question: '申辦時需要準備哪些資料？',
        answer: '所需資料會依服務類型不同而異。請依申辦頁面的欄位與附件說明準備身分驗證及相關證明文件。',
    },
    {
        question: '送出申請後，如何查詢案件進度？',
        answer: '可至「案件進度查詢」輸入申請人姓名查詢目前處理狀態與進度。',
    },
    {
        question: '填寫資料後可以修改嗎？',
        answer: '送出前可隨時返回上一步修改。送出後如需更正，請依案件通知內容聯繫承辦單位。',
    },
    {
        question: '多久會收到申辦結果？',
        answer: '處理時間視案件種類與資料完整度而定；您可在案件進度查詢頁面查看最新狀態。',
    },
];

function FAQPage() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <main className="faq-page">
            <div className="faq-content">
                <p className="eyebrow">FAQ</p>
                <h1>常見申辦問答</h1>
                <p className="faq-intro">整理線上申辦常見問題，協助您快速完成服務申請。</p>

                <section className="faq-list" aria-label="常見申辦問答列表">
                    {faqItems.map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <article className={`faq-item ${isOpen ? 'is-open' : ''}`} key={item.question}>
                                <button
                                    className="faq-question"
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                >
                                    <span>{item.question}</span>
                                    <span className="faq-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                                </button>
                                {isOpen && <p className="faq-answer">{item.answer}</p>}
                            </article>
                        );
                    })}
                </section>
            </div>
        </main>
    );
}

export default FAQPage;
