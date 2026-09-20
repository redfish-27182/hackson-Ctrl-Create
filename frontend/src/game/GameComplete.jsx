import { CheckCircle2, Fingerprint, MailWarning, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import './GameComplete.css';

const FINDINGS = [
    { icon: ShieldAlert, title: '身分證資料外洩', text: '正反面身分證可被用於冒用身分與帳號註冊。' },
    { icon: MailWarning, title: '郵件誘導點擊', text: '看似正常的訊息可能將你導向釣魚連結。' },
    { icon: Fingerprint, title: '生物特徵蒐集', text: '自拍照與語音樣本可能被用於深偽造與聲紋詐騙。' },
];

function GameComplete() {
    return (
        <section className="game-complete" aria-labelledby="game-complete-title">
            <div className="game-complete__glow" aria-hidden="true" />
            <div className="game-complete__card">
                <div className="game-complete__badge"><CheckCircle2 size={24} /> MISSION COMPLETE</div>
                <p className="game-complete__eyebrow">CYBERSECURITY AWARENESS</p>
                <h1 id="game-complete-title">通關成功</h1>
                <p className="game-complete__summary">你成功找出對話、郵件與網站流程中隱藏的資安風險。</p>
                <div className="game-complete__findings">
                    {FINDINGS.map(({ icon: Icon, title, text }, index) => (
                        <article key={title}>
                            <span><Icon size={21} /></span>
                            <div><small>線索 0{index + 1}</small><h2>{title}</h2><p>{text}</p></div>
                        </article>
                    ))}
                </div>
                <Link className="game-complete__home" to="/">返回首頁</Link>
            </div>
        </section>
    );
}

export default GameComplete;
