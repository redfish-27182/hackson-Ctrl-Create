import { ChevronLeft, Image, MessageCircle, Phone, Search, Video, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import './PhoneAppBase.css';
import './LineApp.css';

// 使用者資料：image 的同名檔案放進 LineUserImage 資料夾後會自動顯示。
const INITIAL_USERS = [
    { id: 'zhou-yu-chen', image: 'zhou-yuchen.png', name: '周宇辰❤️', latestMessage: '我現在真的很不舒服，醫生也在催…', time: '18:02', unreadCount: 3 },
    { id: 'xiao-wen', image: 'xiao-wen.png', name: '小文', latestMessage: '那個人可能就是你。', time: '18:15', unreadCount: 2 },
];

// 每筆訊息包含日期、文字或圖片檔名、傳送方、時間與我方訊息的已讀狀態。
const CONVERSATIONS = {
    'zhou-yu-chen': [
        { id: 'z1', date: '7月1日', text: '今天改計畫書是不是很累？\n妳每次壓力大都會忘記吃飯，先去吃東西。', isMine: false, time: '22:18' },
        { id: 'z2', date: '7月1日', text: '你怎麼什麼都記得🥹', isMine: true, time: '22:19', read: true },
        { id: 'z3', date: '7月1日', text: '因為您的事情，我都放在心上。', isMine: false, time: '22:20' },
        { id: 'z4', date: '7月2日', text: '你今天怎麼突然叫我「您」？', isMine: true, time: '21:27', read: true },
        { id: 'z5', date: '7月2日', text: '公司信件打太多了啦，一時沒切換回來😂', isMine: false, time: '21:28' },
        { id: 'z6', date: '7月2日', text: '而且你昨天不是說不吃辣嗎？', isMine: true, time: '21:29', read: true },
        { id: 'z7', date: '7月2日', text: '我有說過嗎？最近太累，記錯了吧。', isMine: false, time: '21:30' },
        { id: 'z8', date: '7月4日', text: '寶貝，我剛剛發生車禍，現在人在急診。', isMine: false, time: '18:02' },
        { id: 'z9', date: '7月4日', image: 'emergency-room.png', isMine: false, time: '18:02', evidence: true },
        { id: 'z10', date: '7月4日', text: '我的帳戶現在不能用，可以先幫我付20,000元醫療費嗎？晚一點一定還妳。', isMine: false, time: '18:03' },
        { id: 'z11', date: '7月4日', text: '你傷得嚴重嗎？可以先視訊嗎？', isMine: true, time: '18:04', read: false },
        { id: 'z12', date: '7月4日', text: '我現在真的很不舒服，醫生也在催，晚點再說好不好？', isMine: false, time: '18:05' },
    ],
    'xiao-wen': [
        { id: 'w1', date: '7月4日', text: '他剛剛說出車禍，叫我先匯20,000元。', isMine: true, time: '18:06', read: true },
        { id: 'w2', date: '7月4日', text: '【轉傳周宇辰的急診照片】', isMine: true, time: '18:07', read: true },
        { id: 'w3', date: '7月4日', text: '你先不要匯款。', isMine: false, time: '18:10' },
        { id: 'w4', date: '7月4日', text: '你有看到這張照片最上面的通知嗎？', isMine: false, time: '18:11' },
        { id: 'w5', date: '7月4日', text: '上面寫著：「A17工作群組——21:30後由小傑接手。」', isMine: false, time: '18:12' },
        { id: 'w6', date: '7月4日', text: 'A17是誰？為什麼還要有人接手？', isMine: true, time: '18:13', read: true },
        { id: 'w7', date: '7月4日', text: '我不知道，但如果A17是某個聊天對象的編號，那個人可能就是你。', isMine: false, time: '18:15' },
    ],
};

const IMAGE_MODULES = import.meta.glob('./LineUserImage/*.{png,jpg,jpeg,webp,gif}', { eager: true, import: 'default', query: '?url' });
const LINE_IMAGES = Object.fromEntries(Object.entries(IMAGE_MODULES).map(([path, url]) => [path.split('/').pop(), url]));

function LineAvatar({ image, name }) {
    const src = LINE_IMAGES[image];
    if (src) return <img className="line-avatar" src={src} alt={`${name} 的大頭貼`} />;
    return <span className="line-avatar line-avatar--fallback" aria-label={`${name} 的大頭貼`}>{name.slice(0, 1)}</span>;
}

function EvidenceImage({ image, onOpen }) {
    const src = LINE_IMAGES[image];
    return (
        <button className="line-evidence" type="button" onClick={onOpen}>
            {src ? <img src={src} alt="急診室照片，點擊查看線索" /> : <Image size={34} />}
            <span>急診室照片 · 點擊查看</span>
        </button>
    );
}

function LineApp({ onHome }) {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
    const selectedUser = useMemo(() => users.find((user) => user.id === selectedUserId), [selectedUserId, users]);

    const openConversation = (userId) => {
        setUsers((currentUsers) => currentUsers.map((user) => (
            user.id === userId ? { ...user, unreadCount: 0 } : user
        )));
        setSelectedUserId(userId);
    };

    if (selectedUser) {
        const messages = CONVERSATIONS[selectedUser.id] ?? [];
        let previousDate = '';
        return (
            <section className="phone-page phone-page--line">
                <header className="phone-page__header line-app__chat-header">
                    <button className="phone-page__back" type="button" onClick={() => setSelectedUserId(null)}><ChevronLeft size={20} /> 聊天</button>
                    <div className="line-app__chat-title"><LineAvatar image={selectedUser.image} name={selectedUser.name} /><b>{selectedUser.name}</b></div>
                    <span className="line-app__chat-actions"><Phone size={17} /><Video size={17} /></span>
                </header>
                <div className="line-app__message-list">
                    {messages.map((message) => {
                        const showDate = message.date !== previousDate;
                        previousDate = message.date;
                        return (
                            <div className="line-message-group" key={message.id}>
                                {showDate && <p className="line-message__date">{message.date}</p>}
                                <div className="line-message" data-mine={message.isMine}>
                                    <div className="line-message__bubble">
                                        {message.text && <p>{message.text}</p>}
                                        {message.image && (message.evidence ? <EvidenceImage image={message.image} onOpen={() => setIsEvidenceOpen(true)} /> : <EvidenceImage image={message.image} onOpen={() => {}} />)}
                                    </div>
                                    <div className="line-message__meta">{message.isMine && <span>{message.read ? '已讀' : '未讀'}</span>}<time>{message.time}</time></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="line-app__composer">輸入訊息… <span>＋</span></div>

                {isEvidenceOpen && (
                    <div className="line-evidence-modal" role="dialog" aria-modal="true" aria-label="急診室照片線索">
                        <button className="line-evidence-modal__backdrop" type="button" aria-label="關閉照片" onClick={() => setIsEvidenceOpen(false)} />
                        <div className="line-evidence-modal__content">
                            <button className="line-evidence-modal__close" type="button" aria-label="關閉照片" onClick={() => setIsEvidenceOpen(false)}><X size={20} /></button>
                            {LINE_IMAGES['emergency-room.png'] ? <img src={LINE_IMAGES['emergency-room.png']} alt="急診室照片" /> : <div className="line-evidence-modal__placeholder"><Image size={54} /><span>emergency-room.png</span></div>}
                            <div className="line-evidence-modal__notification"><b>A17工作群組</b><span>21:30後由小傑接手</span></div>
                            <p>照片上方保留了一則交班通知。</p>
                        </div>
                    </div>
                )}
            </section>
        );
    }

    return (
        <section className="phone-page phone-page--line">
            <div className="line-app__search" aria-hidden="true"><Search size={16} /><span>搜尋</span></div>
            <div className="line-app__user-list" aria-label="LINE 聊天列表">
                {users.map((user) => (
                    <button className="line-user" key={user.id} type="button" onClick={() => openConversation(user.id)}>
                        <LineAvatar image={user.image} name={user.name} />
                        <div className="line-user__content"><b>{user.name}</b><span>{user.latestMessage}</span></div>
                        <div className="line-user__meta"><time>{user.time}</time>{user.unreadCount > 0 && <span>{user.unreadCount}</span>}</div>
                    </button>
                ))}
            </div>
        </section>
    );
}

export default LineApp;
