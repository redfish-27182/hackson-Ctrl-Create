import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './PhoneGuide.css';

/**
 * 集中管理手機導覽步驟。日後可在此新增其他 App 或事件的教學流程。
 */
const GUIDE_STEPS = {
    'line-app': {
        element: '[data-guide="line-app"]',
        title: '教學',
        description: '點擊 LINE，查看對話線索。',
        side: 'right',
    },
    'line-first-user': {
        element: '[data-guide="line-first-user"]',
        title: '教學',
        description: '點擊第一位用戶，查看可疑對話。',
        side: 'right',
    },
    'line-id-card-photos': {
        allowClose: true,
        showButtons: ['previous', 'next', 'close'],
        disableActiveInteraction: true,
        steps: [
            {
                element: '[data-guide="id-card-front"]',
                title: '劇情提示：身分證正面',
                description: '身分證正面含有姓名、照片、生日與證號，交出去後很容易被拿來冒用身分或註冊帳號。',
                side: 'left',
            },
            {
                element: '[data-guide="id-card-back"]',
                title: '劇情提示：身分證背面',
                description: '背面同樣可能被用來完成身分驗證。就算對方自稱親近的人，也不要因為催促就交出證件照片。',
                side: 'left',
            },
        ],
    },
    'gmail-heartsync-image-bottom': {
        element: '[data-guide="gmail-heartsync-image-bottom"]',
        title: '查看圖片內容',
        description: '點擊圖片下方區域，繼續劇情。',
        side: 'top',
        showButtons: [],
        disableActiveInteraction: false,
        advanceOnClick: true,
    },
    'heartsync-materials-photo': {
        allowClose: true,
        showButtons: ['previous', 'next', 'close'],
        disableActiveInteraction: true,
        steps: [
            { element: '[data-guide="heartsync-selfie"]', title: '自拍照也是生物特徵資料', description: '臉部影像可能被用於冒用身分、深偽造，或與其他資料交叉追蹤；不應輕易交給來源不明的服務。', side: 'top' },
            { element: '[data-guide="heartsync-voice-sample"]', title: '語音樣本可被複製聲紋', description: '短語音也可能被拿來建立聲紋或合成聲音，進而用於詐騙親友與繞過語音驗證。', side: 'top' },
        ],
    },
    'heartsync-materials-voice': {
        allowClose: true,
        showButtons: ['previous', 'next', 'close'],
        disableActiveInteraction: true,
        steps: [
            { element: '[data-guide="heartsync-voice-sample"]', title: '語音樣本可被複製聲紋', description: '短語音也可能被拿來建立聲紋或合成聲音，進而用於詐騙親友與繞過語音驗證。', side: 'top' },
            { element: '[data-guide="heartsync-selfie"]', title: '自拍照也是生物特徵資料', description: '臉部影像可能被用於冒用身分、深偽造，或與其他資料交叉追蹤；不應輕易交給來源不明的服務。', side: 'top' },
        ],
    },
};

function PhoneGuide({ step, onComplete }) {
    useEffect(() => {
        const guideStep = GUIDE_STEPS[step];
        if (!guideStep) return undefined;

        const guideSteps = guideStep.steps ?? [guideStep];
        const showButtons = guideStep.showButtons ?? [];

        const guide = driver({
            animate: true,
            allowClose: guideStep.allowClose ?? false,
            overlayColor: '#000',
            overlayOpacity: 0.62,
            stagePadding: 8,
            disableActiveInteraction: guideStep.disableActiveInteraction ?? false,
            advanceOnClick: guideStep.advanceOnClick ?? false,
            onDoneClick: () => {
                guide.destroy();
                onComplete?.(step);
            },
            steps: guideSteps.map((item) => ({
                element: item.element,
                popover: {
                    title: item.title,
                    description: item.description,
                    side: item.side,
                    align: item.align ?? 'start',
                    showButtons: item.showButtons ?? showButtons,
                    nextBtnText: '下一步',
                    prevBtnText: '上一步',
                    doneBtnText: '知道了',
                    popoverClass: 'phone-line-guide',
                },
            })),
        });

        const timerId = window.setTimeout(() => guide.drive(), 120);

        return () => {
            window.clearTimeout(timerId);
            guide.destroy();
        };
    }, [step]);

    return null;
}

export default PhoneGuide;
