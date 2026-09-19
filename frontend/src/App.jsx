import { useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import TopNavigation from './components/layout/TopNavigation';
import HeroCarousel from './components/home/HeroCarousel';
import SearchPage from './pages/SearchPage/SearchPage';
import FAQPage from './pages/FAQPage/FAQPage';
import AIButton from './components/chat/AIButton';
import AIChatModal from './components/chat/AIChatModal';
import CybersecurityGame from './game/Game';
import ApplyPage from './components/ApplyPage';

// 前端自動以目前網址主機 (如 localhost) 連至後端 5000 port
export const BACKEND_URL =
    typeof window !== 'undefined' && window.location.hostname
        ? `http://${window.location.hostname}:5000`
        : 'http://localhost:5000';

// HomePage component: 顯示首頁內容，包括 HeroCarousel 和服務介紹
function HomePage() {
    return (
        <main>
            <HeroCarousel />
            <section className="service-intro" aria-labelledby="service-heading">
                <p className="eyebrow">DIGITAL PUBLIC SERVICE</p>
                <h1 id="service-heading">貼近生活的數位案件服務</h1>
                <p>從申辦、查詢到通知，讓每一個步驟都更簡單、更安心。</p>
            </section>
        </main>
    );
}

// InformationPage component: 顯示服務資訊的簡單頁面
function InformationPage() {
    return (
        <main className="simple-page">
            <p className="eyebrow">SERVICE CENTER</p>
            <h1>服務資訊</h1>
            <p>請由上方選單選擇您需要的案件或便民服務。</p>
        </main>
    );
}

// App component: 根組件，負責路由與全域狀態管理
function AppContent() {
    const [isAiChatOpen, setIsAiChatOpen] = useState(false); // 狀態：AI 聊天視窗是否開啟
    const { pathname } = useLocation(); // 取得當前路徑名
    const isGamePage = pathname === '/cybersecurity-game'; // 判斷是否在遊戲頁面

    return (
        <>
            {!isGamePage && <TopNavigation />}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/case-progress" element={<SearchPage />} />
                <Route path="/apply" element={<ApplyPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/cybersecurity-game" element={<CybersecurityGame />} />
                <Route path="*" element={<InformationPage />} />
            </Routes>
            {!isGamePage && (
                <>
                    <AIButton
                        isOpen={isAiChatOpen}
                        onClick={() => setIsAiChatOpen(true)}
                    />
                    <AIChatModal
                        isOpen={isAiChatOpen}
                        onClose={() => setIsAiChatOpen(false)}
                    />
                </>
            )}
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
