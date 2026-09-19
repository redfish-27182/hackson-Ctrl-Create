import { ChevronLeft, CheckSquare, PenLine } from 'lucide-react';
import './PhoneAppBase.css';
import './NotesApp.css';

function NotesApp({ onHome }) {
    return (
        <section className="phone-page phone-page--notes">
            {/* 備忘錄頁以勾選清單呈現任務內容。 */}
            <header className="phone-page__header">
                <button className="phone-page__back" type="button" onClick={onHome}><ChevronLeft size={20} /> 主畫面</button>
                <b>備忘錄</b>
                <PenLine size={18} />
            </header>
            <article className="notes-app__note">
                <h2>資安調查筆記</h2>
                <small>今天 09:41</small>
                <p><CheckSquare size={17} />確認異常登入來源</p>
                <p><CheckSquare size={17} />檢查附件是否安全</p>
                <p><CheckSquare size={17} />通知資安小隊</p>
            </article>
        </section>
    );
}

export default NotesApp;
