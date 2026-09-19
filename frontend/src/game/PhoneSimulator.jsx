import { useRef, useState } from 'react';
import {
    AtSign,
    Camera,
    Download,
    FileText,
    House,
    LockKeyhole,
    Mail,
    MessageCircle,
    NotebookPen,
    ScanLine,
    Settings,
    Share2,
    SlidersHorizontal,
} from 'lucide-react';
import FilesApp from './apps/FilesApp';
import GmailApp from './apps/GmailApp';
import HeartSyncPhishingPage from './apps/HeartSyncPhishingPage';
import LineApp from './apps/LineApp';
import NotesApp from './apps/NotesApp';
import PhoneGuide from './PhoneGuide';
import './PhoneSimulator.css';

// 桌面 App 資料：screen 存在時才可切換至對應頁面。
const APPS = [
    { id: 'line', name: 'LINE', icon: MessageCircle, unread: 1, screen: 'LINE' },
    { id: 'gmail', name: 'Gmail', icon: Mail, unread: 2, screen: 'GMAIL' },
    { id: 'files', name: '檔案', icon: FileText, screen: 'FILES' },
    { id: 'notes', name: '備忘錄', icon: NotebookPen, screen: 'NOTES' },
    { id: 'fb', name: 'Facebook', icon: Share2 },
    { id: 'ig', name: 'Instagram', icon: Camera },
    { id: 'threads', name: 'Threads', icon: AtSign },
    { id: 'settings', name: '設定', icon: Settings },
    { id: 'appstore', name: 'App Store', icon: Download },
];

// iOS 輔助觸控選單的四個方向按鍵；僅 home 具實際導頁功能。
const ASSISTIVE_ACTIONS = [
    { id: 'rotation', name: '鎖定旋轉', icon: LockKeyhole },
    { id: 'home', name: '主畫面', icon: House },
    { id: 'control', name: '控制中心', icon: SlidersHorizontal },
    { id: 'screenshot', name: '截圖', icon: ScanLine },
];

function PhoneSimulator({ guideStep = null, onGuideStepChange }) {
    // 手機目前所在畫面與輔助觸控選單的開啟狀態。
    const [currentScreen, setCurrentScreen] = useState('HOME');
    const [isAssistiveOpen, setIsAssistiveOpen] = useState(false);
    const [assistivePosition, setAssistivePosition] = useState({ x: 286, y: 572 });
    const screenRef = useRef(null); // 記錄手機螢幕的 DOM 節點，供白點拖曳時計算邊界。
    const dragRef = useRef(null); // 記錄白點拖曳的起始座標與是否有移動。

    // 不可點擊 App 沒有 screen，因此不會觸發畫面切換。
    const openApp = (app) => {
        if (app.screen) setCurrentScreen(app.screen);
        if (app.id === 'line') onGuideStepChange?.('line-first-user');
    };

    // 記錄按下座標，供後續計算白點拖曳距離。
    const handleAssistivePointerDown = (event) => {
        const point = assistivePosition;
        dragRef.current = { startX: event.clientX, startY: event.clientY, point, moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    // 將白點限制在手機螢幕範圍內，避免被拖出外框。
    const handleAssistivePointerMove = (event) => {
        if (!dragRef.current || !screenRef.current) return;

        const { startX, startY, point } = dragRef.current;
        const bounds = screenRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(bounds.width - 42, point.x + event.clientX - startX));
        const y = Math.max(36, Math.min(bounds.height - 42, point.y + event.clientY - startY));

        if (Math.abs(event.clientX - startX) > 4 || Math.abs(event.clientY - startY) > 4) {
            dragRef.current.moved = true;
        }
        setAssistivePosition({ x, y });
    };

    // 若沒有拖曳，則切換輔助觸控選單的開啟狀態。
    const handleAssistivePointerUp = () => {
        const wasDragged = dragRef.current?.moved;
        dragRef.current = null;
        if (!wasDragged) setIsAssistiveOpen((isOpen) => !isOpen);
    };

    // 目前只有主畫面按鍵有功能；其他按鍵僅作介面裝飾。
    const handleAssistiveAction = (actionId) => {
        if (actionId === 'home') setCurrentScreen('HOME');
        setIsAssistiveOpen(false);
    };

    // 依畫面狀態載入不同 App JSX，但全部都在同一個手機螢幕中。
    const renderScreen = () => {
        const pageProps = {
            onHome: () => setCurrentScreen('HOME'),
            onFirstUserOpened: () => onGuideStepChange?.(null),
            onIdentityCardGuideOpen: () => {
                onGuideStepChange?.(null);
                window.setTimeout(() => onGuideStepChange?.('line-id-card-photos'), 20);
            },
            onHeartSyncOpen: () => setCurrentScreen('HEARTSYNC'),
            onCloseHeartSync: () => setCurrentScreen('LINE'),
        };
        if (currentScreen === 'LINE') return <LineApp {...pageProps} />;
        if (currentScreen === 'GMAIL') return <GmailApp {...pageProps} />;
        if (currentScreen === 'HEARTSYNC') return <HeartSyncPhishingPage onClose={pageProps.onCloseHeartSync} />;
        if (currentScreen === 'FILES') return <FilesApp {...pageProps} />;
        if (currentScreen === 'NOTES') return <NotesApp {...pageProps} />;

        return (
            <div className="phone-home">
                <div className="phone-home__apps">
                    {APPS.map((app) => {
                        const Icon = app.icon;
                        const isInteractive = Boolean(app.screen);
                        return (
                            <button
                                className="phone-app"
                                data-interactive={isInteractive}
                                data-guide={app.id === 'line' ? 'line-app' : undefined}
                                key={app.id}
                                type="button"
                                aria-label={isInteractive ? `開啟 ${app.name}` : app.name}
                                onClick={() => openApp(app)}
                            >
                                <span className="phone-app__icon" data-app={app.id}>
                                    <Icon size={29} strokeWidth={2.2} />
                                    {app.unread && <span className="phone-app__badge">{app.unread}</span>}
                                </span>
                                <span className="phone-app__name">{app.name}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="phone-home__dock" aria-hidden="true"><span /></div>
            </div>
        );
    };

    return (
        <section className="phone-simulator" aria-label="智慧型手機模擬器">
            <div className="phone-simulator__screen" ref={screenRef}>
                <div className="phone-simulator__wallpaper" aria-hidden="true" />
                <div className="phone-simulator__island" aria-hidden="true" />
                <div className="phone-simulator__status-bar"><span>9:41</span><span>5G ▰◔</span></div>
                {renderScreen()}
                <PhoneGuide step={guideStep} />

                {/* 點擊白點後顯示四方向的輔助觸控選單。 */}
                {isAssistiveOpen && (
                    <div className="phone-assistive-menu" aria-label="輔助觸控選單">
                        {ASSISTIVE_ACTIONS.map((action) => {
                            const Icon = action.icon;
                            return (
                                <button className="phone-assistive-menu__action" data-action={action.id} key={action.id} type="button" onClick={() => handleAssistiveAction(action.id)}>
                                    <Icon size={22} /><span>{action.name}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 白點採 Pointer Events，同時支援滑鼠與觸控拖曳。 */}
                <button
                    className="phone-assistive-dot"
                    type="button"
                    aria-label="開啟輔助觸控選單"
                    style={{ left: assistivePosition.x, top: assistivePosition.y }}
                    onPointerDown={handleAssistivePointerDown}
                    onPointerMove={handleAssistivePointerMove}
                    onPointerUp={handleAssistivePointerUp}
                />
            </div>
        </section>
    );
}

export default PhoneSimulator;
