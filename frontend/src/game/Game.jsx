import { useState } from 'react';
import { Link } from 'react-router-dom';
import PixelTypewriter from './PixelTypewriter';
import PhoneSimulator from './PhoneSimulator';
import GameNarration from './GameNarration';
import './Game.css';

const PROLOGUE = [
    '安晴從昨晚開始失去聯絡。',
    '她的帳戶在失聯前，分兩次匯出了五萬元。',
    '房間裡只留下這支手機，以及幾段可疑的對話。',
    '請找出「周宇辰」的真實身分，還原安晴遭遇的一切。',
];

function CybersecurityGame() {
    const [isPrologueComplete, setIsPrologueComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [narrationStage, setNarrationStage] = useState(null);

    return (
        <main className="cyber-game">
            <Link className="game-exit" to="/">← 退出遊戲</Link>

            {!hasStarted ? (
                <section className="game-prologue" aria-labelledby="prologue-title">
                    <p className="game-prologue__eyebrow">MISSION BRIEFING</p>
                    <h1 id="prologue-title">前情提要</h1>
                    <PixelTypewriter
                        paragraphs={PROLOGUE}
                        onComplete={() => setIsPrologueComplete(true)}
                    />
                    {isPrologueComplete && (
                        <button
                            className="game-prologue__next"
                            type="button"
                            onClick={() => {
                                setHasStarted(true);
                                setNarrationStage('phone-intro');
                            }}
                        >
                            調查開始
                        </button>
                    )}
                </section>
            ) : (
                <div className="game-phone-stage">
                    <div className="game-phone-shell">
                        <PhoneSimulator />
                        <GameNarration
                            stageId={narrationStage}
                            onComplete={() => setNarrationStage(null)}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}

export default CybersecurityGame;
