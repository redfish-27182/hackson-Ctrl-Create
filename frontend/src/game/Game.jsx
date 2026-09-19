import { useState } from 'react';
import { Link } from 'react-router-dom';
import PixelTypewriter from './PixelTypewriter';
import PhoneSimulator from './PhoneSimulator';
import GameNarration from './GameNarration';
import './Game.css';

const PROLOGUE = [
    '安晴最近發現，周宇辰知道許多她沒有說過的事情。',
    '手機也顯示 HeartSync 多次存取她的相簿、麥克風及聯絡人。',
    '請檢查 LINE、HeartSync 和 Gmail，找出她的資料如何外洩。',
    '並阻止不必要的資料與帳號權限繼續被使用。',
];
function CybersecurityGame() {
    const [isPrologueComplete, setIsPrologueComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [narrationStage, setNarrationStage] = useState(null);
    const [guideStep, setGuideStep] = useState(null);

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
                        <PhoneSimulator
                            guideStep={guideStep}
                            onGuideStepChange={setGuideStep}
                        />
                        <GameNarration
                            stageId={narrationStage}
                            onComplete={() => {
                                setNarrationStage(null);
                                setGuideStep('line-app');
                            }}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}

export default CybersecurityGame;
