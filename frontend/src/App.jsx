import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import TopNavigation from './components/TopNavigation';
import HeroCarousel from './components/HeroCarousel';
import SearchPage from './components/searchPage';
import FAQPage from './components/FAQPage';
import AIButton from './components/AIButton';
import AIChatModal from './components/AIChatModal';

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
function App() {
    const [isAiChatOpen, setIsAiChatOpen] = useState(false);

    return (
        <BrowserRouter>
            <TopNavigation />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/case-progress" element={<SearchPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="*" element={<InformationPage />} />
            </Routes>
            <AIButton
                isOpen={isAiChatOpen}
                onClick={() => setIsAiChatOpen(true)}
            />
            <AIChatModal
                isOpen={isAiChatOpen}
                onClose={() => setIsAiChatOpen(false)}
            />
        </BrowserRouter>
    );
}

export default App;
