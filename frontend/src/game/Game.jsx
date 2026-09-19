import { useState } from 'react';
import { Link } from 'react-router-dom';
import PixelTypewriter from './PixelTypewriter';
import PhoneSimulator from './PhoneSimulator';
import './Game.css';

const PROLOGUE = [
    '城市的網路防線正遭受未知入侵。',
    '你收到一封沒有署名的求救訊息。',
    '找出破口，阻止攻擊擴散。',
];

function CybersecurityGame() {
    const [isPrologueComplete, setIsPrologueComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

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
                            onClick={() => setHasStarted(true)}
                        >
                            下一步 →
                        </button>
                    )}
                </section>
            ) : (
                <div className="game-phone-stage">
                    <PhoneSimulator />
                </div>
            )}
        </main>
    );
}

export default CybersecurityGame;
