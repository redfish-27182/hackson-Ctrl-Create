import { useState } from 'react';
import { Link } from 'react-router-dom';
import PixelTypewriter from './PixelTypewriter';
import PhoneSimulator from './PhoneSimulator';
import GameNarration from './GameNarration';
import './Game.css';

const PROLOGUE = [
    'HeartSync 在過去 7 天內，多次存取相簿、麥克風與聯絡人。',
];;
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
                  <p className="game-prologue__eyebrow">PRIVACY ALERT</p>
<h1 id="prologue-title">偵測到異常存取</h1>
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
                           查看安晴的訊息
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
