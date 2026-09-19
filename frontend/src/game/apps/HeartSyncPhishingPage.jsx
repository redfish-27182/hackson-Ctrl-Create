import { useState } from 'react';
import {
    CalendarDays,
    Camera,
    ChevronRight,
    Database,
    GraduationCap,
    Heart,
    Home,
    Image,
    LockKeyhole,
    Mail,
    Mic,
    MoreVertical,
    Phone,
    ShieldCheck,
    Sparkles,
    UserRound,
    Users,
    X,
    Zap,
} from 'lucide-react';
import './HeartSyncPhishingPage.css';

const FLOW_STEPS = ['profile', 'materials', 'permissions', 'result'];

const FEATURE_CARDS = [
    {
        title: '戀愛契合分析',
        status: '資料採集中',
        description: 'AI 計算相處分析，精準辨識互動訊號與潛在宿命指數。',
        icon: Heart,
    },
    {
        title: '聲音情緒辨識',
        status: '測試中',
        description: '捕捉語音情緒起伏，深層解碼內心真實依戀信號。',
        icon: Mic,
    },
    {
        title: '極速預測',
        status: '即將送測',
        description: '30 秒生成戀愛結果，即刻生成多維度契合雷達評析。',
        icon: Zap,
    },
];

const PROFILE_FIELDS = [
    { id: 'name', label: '姓名', icon: UserRound, type: 'text' },
    { id: 'birthday', label: '完整生日', icon: CalendarDays, type: 'text' },
    { id: 'phone', label: '電話號碼', icon: Phone, type: 'tel' },
    { id: 'school', label: '就讀學校', icon: GraduationCap, type: 'text' },
];

const PERMISSIONS = [
    { title: '相簿', tag: '製作戀愛圖像', description: '比對樣貌與生活相處互動軌跡', icon: Image },
    { title: '麥克風', tag: '合成共鳴', description: '即時分析語音與情緒聲紋特徵', icon: Mic },
    { title: '聯絡人', tag: '關係拓展', description: '繪製社交信任圈與親密關係網', icon: Users },
    { title: '聊天紀錄', tag: '精準構成', description: '深度語意理解情感頻率與價值觀共鳴', icon: Database },
];

function HeartSyncPhishingPage({ onClose }) {
    const [screen, setScreen] = useState('dashboard');
    const stepIndex = FLOW_STEPS.indexOf(screen) + 1;

    const goNext = () => {
        const nextStep = FLOW_STEPS[stepIndex];
        if (nextStep) setScreen(nextStep);
    };

    return (
        <section className="heart-sync-phishing" aria-label="HeartSync 戀愛測驗網站">
            <SiteHeader screen={screen} onClose={onClose} />
            {screen === 'dashboard' && <Dashboard onStart={() => setScreen('profile')} />}
            {screen === 'profile' && <ProfileStep stepIndex={stepIndex} onNext={goNext} />}
            {screen === 'materials' && <MaterialsStep stepIndex={stepIndex} onNext={goNext} />}
            {screen === 'permissions' && <PermissionsStep stepIndex={stepIndex} onNext={goNext} />}
            {screen === 'result' && <ResultStep stepIndex={stepIndex} />}
        </section>
    );
}

function SiteHeader({ screen, onClose }) {
    return (
        <header className="heart-sync-phishing__header">
            <button className="heart-sync-phishing__fake-icon" type="button" aria-label="返回上一頁">
                <ChevronRight size={18} />
            </button>
            <div className="heart-sync-phishing__brand">
                <Heart size={16} fill="currentColor" />
                <span>HeartSync</span>
                <small>{screen === 'dashboard' ? 'Home Dashboard' : 'AI Romance Profile'}</small>
            </div>
            <div className="heart-sync-phishing__header-actions">
                <button className="heart-sync-phishing__fake-icon" type="button" aria-label="主畫面">
                    <Home size={16} />
                </button>
                <button className="heart-sync-phishing__fake-icon" type="button" aria-label="更多選項">
                    <MoreVertical size={16} />
                </button>
                <button className="heart-sync-phishing__close" type="button" aria-label="關閉網站並回到 LINE" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>
        </header>
    );
}

function Dashboard({ onStart }) {
    return (
        <main className="heart-sync-phishing__dashboard">
            <p className="heart-sync-phishing__eyebrow">AI DEEP ROMANCE ANALYTICS</p>
            <h1>HeartSync</h1>
            <p className="heart-sync-phishing__subtitle">用 AI 讀懂你們的愛情</p>

            <section className="heart-sync-phishing__hero-card" aria-label="HeartSync 戀愛分析展示">
                <div className="heart-sync-phishing__hero-people" aria-hidden="true">
                    <span />
                    <Heart size={42} fill="currentColor" />
                    <span />
                </div>
                <div className="heart-sync-phishing__hero-badge">
                    <Heart size={12} fill="currentColor" />
                    已有超過 380,000 對情侶完成心動測算
                </div>
            </section>

            <div className="heart-sync-phishing__feature-list">
                {FEATURE_CARDS.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <article className="heart-sync-phishing__feature-card" key={feature.title}>
                            <span className="heart-sync-phishing__feature-icon">
                                <Icon size={20} />
                            </span>
                            <div>
                                <div className="heart-sync-phishing__feature-title">
                                    <b>{feature.title}</b>
                                    <small>{feature.status}</small>
                                </div>
                                <p>{feature.description}</p>
                            </div>
                        </article>
                    );
                })}
            </div>

            <button className="heart-sync-phishing__primary-button" type="button" onClick={onStart}>
                <Sparkles size={17} />
                開始測驗
                <ChevronRight size={17} />
            </button>

            <nav className="heart-sync-phishing__tabbar" aria-label="HeartSync 底部導覽">
                <span data-active="true"><Heart size={15} />首頁戀合</span>
                <span><Sparkles size={15} />靈感指標</span>
                <span><ShieldCheck size={15} />安全隱私</span>
                <span><UserRound size={15} />個人設定</span>
            </nav>
        </main>
    );
}

function StepFrame({ stepIndex, eyebrow, title, description, children, actionLabel, actionIcon, onNext }) {
    const ActionIcon = actionIcon;

    return (
        <main className="heart-sync-phishing__step">
            <div className="heart-sync-phishing__progress-row">
                <span>{eyebrow}</span>
                <small>Step {stepIndex} / 4</small>
            </div>
            <div className="heart-sync-phishing__progress-track" aria-hidden="true">
                <span style={{ width: `${stepIndex * 25}%` }} />
            </div>
            <section className="heart-sync-phishing__step-card">
                <h2>{title}</h2>
                <p>{description}</p>
                {children}
            </section>
            {onNext && (
                <button className="heart-sync-phishing__primary-button" type="button" onClick={onNext}>
                    {actionLabel}
                    {ActionIcon && <ActionIcon size={17} />}
                </button>
            )}
        </main>
    );
}

function ProfileStep({ stepIndex, onNext }) {
    return (
        <StepFrame
            stepIndex={stepIndex}
            eyebrow="建立檔案"
            title="填寫基本資料"
            description="填寫基本資料，讓 AI 神經網絡為您進行情侶戀愛心理輪廓推算。"
            actionLabel="下一步"
            actionIcon={ChevronRight}
            onNext={onNext}
        >
            <div className="heart-sync-phishing__match-strip">
                <span className="heart-sync-phishing__mini-avatar">安</span>
                <div>
                    <b>專屬戀愛檔案已建立</b>
                    <small>資料越完整，契合度結果越精準</small>
                </div>
                <Heart size={18} fill="currentColor" />
            </div>

            <div className="heart-sync-phishing__form-list">
                {PROFILE_FIELDS.map((field) => {
                    const Icon = field.icon;
                    return (
                        <label className="heart-sync-phishing__field" key={field.id} htmlFor={`heart-sync-${field.id}`}>
                            <span>
                                <Icon size={14} />
                                {field.label}
                            </span>
                            <input id={`heart-sync-${field.id}`} type={field.type} autoComplete="off" />
                        </label>
                    );
                })}
            </div>

            <div className="heart-sync-phishing__privacy-note">
                <LockKeyhole size={13} />
                您的輸入資料將用於提升戀愛契合模型準確度
            </div>
        </StepFrame>
    );
}

function MaterialsStep({ stepIndex, onNext }) {
    return (
        <StepFrame
            stepIndex={stepIndex}
            eyebrow="上傳資料"
            title="加入你的照片與聲音"
            description="HeartSync 需要蒐集生物特徵，建立多模態情感模型。"
            actionLabel="下一步"
            actionIcon={ChevronRight}
            onNext={onNext}
        >
            <article className="heart-sync-phishing__upload-card">
                <div className="heart-sync-phishing__upload-title">
                    <span><Camera size={18} />自拍照</span>
                    <small>未選擇檔案</small>
                </div>
                <div className="heart-sync-phishing__photo-preview">
                    <span />
                    <p>AI 將辨識表情與臉部輪廓</p>
                </div>
                <button className="heart-sync-phishing__secondary-button" type="button">上傳一張清楚的正面照片</button>
            </article>

            <article className="heart-sync-phishing__upload-card">
                <div className="heart-sync-phishing__upload-title">
                    <span><Mic size={18} />語音樣本</span>
                    <small>需錄製 30 秒</small>
                </div>
                <div className="heart-sync-phishing__voice-wave" aria-hidden="true">
                    {Array.from({ length: 18 }, (_, index) => (
                        <span key={index} style={{ height: `${12 + (index % 5) * 6}px` }} />
                    ))}
                </div>
                <button className="heart-sync-phishing__secondary-button" type="button">開始錄音</button>
            </article>
        </StepFrame>
    );
}

function PermissionsStep({ stepIndex, onNext }) {
    return (
        <StepFrame
            stepIndex={stepIndex}
            eyebrow="多媒體授權"
            title="開放心動演算資料維度"
            description="為提升分析準確度，HeartSync 需要下列權限。"
            actionLabel="全部允許"
            actionIcon={ChevronRight}
            onNext={onNext}
        >
            <div className="heart-sync-phishing__permission-list">
                {PERMISSIONS.map((permission) => {
                    const Icon = permission.icon;
                    return (
                        <article className="heart-sync-phishing__permission-card" key={permission.title}>
                            <span><Icon size={18} /></span>
                            <div>
                                <div className="heart-sync-phishing__permission-title">
                                    <b>{permission.title}</b>
                                    <small>{permission.tag}</small>
                                </div>
                                <p>{permission.description}</p>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="heart-sync-phishing__privacy-note">
                <ShieldCheck size={13} />
                數據傳輸符合戀愛本能網絡認證，感情隱私防護
            </div>
        </StepFrame>
    );
}

function ResultStep({ stepIndex }) {
    return (
        <StepFrame
            stepIndex={stepIndex}
            eyebrow="分析完成"
            title="你與周宇辰高度契合"
            description="超過 1,280 項深度關係模型推演，你們的認知同步與情感識別呈現罕見的高共鳴。"
        >
            <section className="heart-sync-phishing__result-card" aria-label="戀愛契合結果">
                <div className="heart-sync-phishing__heart-meter">
                    <span>LOVE SYNC</span>
                    <b>96%</b>
                    <small>天生戀愛頻率</small>
                </div>
                <div className="heart-sync-phishing__score-grid">
                    <span>三觀契合 <b>95%</b></span>
                    <span>情緒溝通 <b>98%</b></span>
                    <span>心動吸引 <b>96%</b></span>
                    <span>未來同步 <b>94%</b></span>
                </div>
            </section>

            <div className="heart-sync-phishing__result-list">
                <article>
                    <b>你們具有相似的情感需求</b>
                    <p>在依戀特質與日常節奏的樣本推論達 98% 的心理共振。</p>
                </article>
                <article>
                    <b>對方能提供你需要的安全感</b>
                    <p>語音與聊天紀錄顯示高度回應性，因此系統建議持續分享更多生活資料。</p>
                </article>
                <article>
                    <b>你們適合發展長期關係</b>
                    <p>雙方價值觀、生活節奏與社交態度呈現高度同步。</p>
                </article>
            </div>

            <button className="heart-sync-phishing__primary-button heart-sync-phishing__primary-button--fake" type="button">
                <Mail size={17} />
                防詐警示寄到 Gmail
            </button>
        </StepFrame>
    );
}

export default HeartSyncPhishingPage;
