import { ChevronLeft, Mail, Star } from 'lucide-react';
import './PhoneAppBase.css';
import './GmailApp.css';

function GmailApp({ onHome }) {
    return (
        <section className="phone-page phone-page--gmail">
            {/* 這是獨立的 Gmail 模擬頁，不會離開手機外框。 */}
            <header className="phone-page__header">
                <button className="phone-page__back" type="button" onClick={onHome}><ChevronLeft size={20} /> 主畫面</button>
                <b>Gmail</b>
                <Mail size={18} />
            </header>
            <div className="gmail-app__search">搜尋郵件</div>
            <div className="gmail-app__mail"><b>2</b><div><strong>系統管理員</strong><span>帳號安全通知</span><small>偵測到新的登入嘗試</small></div><Star size={17} /></div>
            <div className="gmail-app__mail"><b>1</b><div><strong>雲端服務</strong><span>重要：變更密碼提醒</span><small>請確認此操作是否由您發起</small></div><Star size={17} /></div>
            <button className="gmail-app__compose" type="button">＋ 撰寫</button>
        </section>
    );
}

export default GmailApp;
