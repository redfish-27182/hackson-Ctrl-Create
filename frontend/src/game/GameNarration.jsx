import { useEffect, useMemo, useState } from 'react';
import './GameNarration.css';

// 事件旁白資料；日後只需在此新增階段，並從 Game 傳入對應的 stageId 即可觸發。
export const NARRATION_STAGES = [
    {
    id: 'phone-intro',
    label: '安晴傳來訊息',
    lines: [
        '「我只是做了一個戀愛測驗。」',
        '「為什麼它一直在讀取我的聯絡人？」',
        '「而且宇辰最近知道很多我根本沒告訴他的事情。」',
        '「可以陪我一起檢查嗎？」',
    ],
    actionLabel: '開始調查',
},
    {
        id: 'line-clue',
        label: 'SYSTEM LOG // 02',
        lines: ['對話中的關心看似自然，但細節開始出現矛盾。'],
        actionLabel: '繼續',
    },
    {
        id: 'gmail-clue',
        label: 'SYSTEM LOG // 03',
        lines: ['一封看似正常的郵件，可能藏著資料遭濫用的證據。'],
        actionLabel: '查看郵件',
    },
];

function GameNarration({ stageId, onComplete, lineDelay = 850 }) {
    const stage = useMemo(
        () => NARRATION_STAGES.find((item) => item.id === stageId),
        [stageId],
    );
    const [visibleLines, setVisibleLines] = useState(0);

    useEffect(() => {
        setVisibleLines(0);
    }, [stageId]);

    useEffect(() => {
        if (!stage || visibleLines >= stage.lines.length) return undefined;
        const timer = window.setTimeout(() => setVisibleLines((count) => count + 1), lineDelay);
        return () => window.clearTimeout(timer);
    }, [lineDelay, stage, visibleLines]);

    if (!stage) return null;

    const isComplete = visibleLines === stage.lines.length;
    return (
        <section className="game-narration" aria-live="polite" aria-label="劇情旁白">
            <p className="game-narration__label">{stage.label}</p>
            <div className="game-narration__lines">
                {stage.lines.slice(0, visibleLines).map((line, index) => <p className="game-narration__line" key={`${stage.id}-${index}`}>{line}</p>)}
            </div>
            {isComplete && <button className="game-narration__start" type="button" onClick={onComplete}>{stage.actionLabel} →</button>}
        </section>
    );
}

export default GameNarration;
