import { useState } from 'react';
import {
    AtSign,
    Camera,
    ChevronLeft,
    Download,
    FileText,
    Mail,
    MessageCircle,
    NotebookPen,
    Settings,
    Share2,
} from 'lucide-react';

// 每筆資料同時提供桌面外觀，以及可選的目標畫面；沒有 screen 的 App 僅供展示。
const APPS = [
    { id: 'line', name: 'LINE', bg: 'bg-[#06C755]', icon: MessageCircle, unread: 1, screen: 'LINE' },
    { id: 'gmail', name: 'Gmail', bg: 'bg-[#EA4335]', icon: Mail, unread: 2, screen: 'GMAIL' },
    { id: 'files', name: '檔案', bg: 'bg-[#007AFF]', icon: FileText, screen: 'FILES' },
    { id: 'notes', name: '備忘錄', bg: 'bg-[#FFD60A]', icon: NotebookPen, screen: 'NOTES' },
    { id: 'fb', name: 'Facebook', bg: 'bg-[#1877F2]', icon: Share2 },
    { id: 'ig', name: 'Instagram', bg: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600', icon: Camera },
    { id: 'threads', name: 'Threads', bg: 'bg-black', icon: AtSign },
    { id: 'settings', name: '設定', bg: 'bg-zinc-600', icon: Settings },
    { id: 'appstore', name: 'App Store', bg: 'bg-[#007AFF]', icon: Download },
];

function PhoneSimulator() {
    // HOME 為桌面；其餘值對應 APPS 陣列中可開啟 App 的 screen。
    const [currentScreen, setCurrentScreen] = useState('HOME');
    // 依目前畫面取出 App 資訊，讓 App 內容頁可重用圖示與名稱。
    const activeApp = APPS.find((app) => app.screen === currentScreen);
    const ActiveIcon = activeApp?.icon ?? Mail;

    // 只有定義 screen 的 App 可以切換畫面；其餘圖示不產生動作。
    const openApp = (app) => {
        if (app.screen) setCurrentScreen(app.screen);
    };

    return (
        <>
            {/* 外層為手機邊框，內層模擬螢幕、桌布與動態島。 */}
            <section className="relative h-[720px] w-[360px] max-w-[calc(100vw-32px)] rounded-[3.4rem] border-[9px] border-zinc-950 bg-zinc-950 p-1 shadow-[0_28px_70px_rgba(0,0,0,.65)] ring-1 ring-zinc-600" aria-label="智慧型手機模擬器">
            <div className="relative h-full overflow-hidden rounded-[2.75rem] bg-gradient-to-b from-sky-950 via-indigo-950 to-fuchsia-950 text-white">
                <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_8%,rgba(125,211,252,.35),transparent_28%),radial-gradient(circle_at_75%_70%,rgba(232,121,249,.3),transparent_35%)]" />
                <div className="absolute left-1/2 top-2 z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />

                <div className="relative z-10 flex items-center justify-between px-7 pt-3 text-[11px] font-semibold">
                    <span>9:41</span>
                    <span className="tracking-[.18em]">5G ▰◔</span>
                </div>

                {currentScreen === 'HOME' ? (
                    <div className="relative z-10 h-full">
                        {/* 以 APPS 資料陣列產生桌面圖示；可開啟 App 才會顯示互動游標與縮放效果。 */}
                        <div className="grid grid-cols-4 gap-y-6 gap-x-4 px-6 pt-10">
                            {APPS.map((app) => {
                                const Icon = app.icon;
                                const isInteractive = Boolean(app.screen);
                                return (
                                    <button
                                        className={`group relative flex flex-col items-center ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
                                        key={app.id}
                                        type="button"
                                        aria-label={isInteractive ? `開啟 ${app.name}` : app.name}
                                        onClick={() => openApp(app)}
                                    >
                                        <span className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${app.bg} text-white shadow-md transition-transform ${isInteractive ? 'group-hover:scale-105 group-active:scale-95' : ''}`}>
                                            <Icon size={29} strokeWidth={2.2} />
                                            {/* unread 存在時，才顯示未讀數圓點。 */}
                                            {app.unread && (
                                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow-sm ring-2 ring-indigo-950">
                                                    {app.unread}
                                                </span>
                                            )}
                                        </span>
                                        <span className="mt-1 w-16 truncate text-center text-[11px] text-zinc-300 drop-shadow">{app.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="absolute bottom-7 left-5 right-5 flex items-center justify-center rounded-[1.8rem] bg-white/20 px-8 py-3 backdrop-blur-md">
                            <span className="h-1.5 w-28 rounded-full bg-white/90" aria-hidden="true" />
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 px-5 pt-8">
                        {/* 內容頁共用同一個返回操作，回到 HOME 桌面。 */}
                        <button className="flex items-center gap-1 text-sm text-white/80" type="button" onClick={() => setCurrentScreen('HOME')}>
                            <ChevronLeft size={20} /> 回到桌面
                        </button>
                        <div className="mt-8 rounded-3xl bg-white/95 p-6 text-zinc-900 shadow-xl">
                            <div className="flex items-center gap-3">
                                <ActiveIcon className={currentScreen === 'LINE' ? 'text-[#06C755]' : currentScreen === 'GMAIL' ? 'text-[#EA4335]' : currentScreen === 'FILES' ? 'text-[#007AFF]' : 'text-[#D4A700]'} />
                                <h2 className="text-xl font-bold">{activeApp?.name}</h2>
                            </div>
                            <p className="mt-5 text-sm leading-6 text-zinc-600">已開啟 {activeApp?.name}。</p>
                        </div>
                    </div>
                )}
            </div>
            </section>
        </>
    );
}

export default PhoneSimulator;
