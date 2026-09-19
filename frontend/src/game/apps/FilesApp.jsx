import { ChevronLeft, FileText, Folder, Image } from 'lucide-react';
import './PhoneAppBase.css';
import './FilesApp.css';

function FilesApp({ onHome }) {
    return (
        <section className="phone-page phone-page--files">
            {/* 檔案頁以資料夾與最近項目呈現不同於信箱的介面。 */}
            <header className="phone-page__header">
                <button className="phone-page__back" type="button" onClick={onHome}><ChevronLeft size={20} /> 主畫面</button>
                <b>檔案</b>
                <span>•••</span>
            </header>
            <h2 className="files-app__title">瀏覽</h2>
            <div className="files-app__folders"><div><Folder /><span>下載項目</span></div><div><Folder /><span>我的文件</span></div></div>
            <p className="files-app__label">最近項目</p>
            <div className="files-app__file"><FileText /><span>incident-report.pdf<small>今天 · PDF 文件</small></span></div>
            <div className="files-app__file"><Image /><span>login-record.png<small>昨天 · 圖片</small></span></div>
        </section>
    );
}

export default FilesApp;
