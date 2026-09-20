import { useEffect, useMemo, useState } from 'react';
import './GameNarration.css';

// 事件旁白資料；日後只需在此新增階段，並從 Game 傳入對應的 stageId 即可觸發。
export const NARRATION_STAGES = [
    {
        id: 'phone-intro',
        label: 'SYSTEM LOG // 01',
        lines: [
            '「安晴從昨天晚上開始就聯絡不上。」',
            '「她前幾天一直說周宇辰出了車禍，後來又說銀行帳戶被鎖住。」',
            '「我剛剛才從阿姨那裡知道，她竟然在同一天匯出了兩筆錢，一共五萬元。」',
            '「她昨晚傳訊息給我，說她覺得事情不太對，想親自去確認。可是她沒有說要去哪裡，手機也留在房間裡。」',
            '「阿姨已經同意我們查看手機。你可以陪我一起找線索嗎？」'
        ],
        actionLabel: '開始調查',
    },
    {
        id: 'line-clue',
        label: 'SYSTEM LOG // 02',
        lines: ['找到線索(1/3)'],
        lines: ['照片傳出的瞬間，資料也可能落入陌生人的手中。請仔細檢視這段對話裡的可疑訊號。'],
        actionLabel: '繼續',
    },
    {
        id: 'gmail-clue',
        label: 'SYSTEM LOG // 03',
        lines: ['找到線索(2/3)'],
        lines: ['一封看似正常的郵件，可能藏著資料遭濫用的證據。'],
        actionLabel: '查看郵件',
    },
    {
        id: 'heartsync-materials-clue',
        label: 'SYSTEM LOG // 04',
        lines: ['你找到了第三個資訊漏洞：網站以戀愛分析為名蒐集自拍照與語音樣本。這些生物特徵一旦外流，可能被用於深偽造、聲紋冒用與詐騙。接下來，繼續找出它還要求了哪些不必要的權限。'],
        actionLabel: '繼續',
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
