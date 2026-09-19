import { Camera, ChevronLeft, Image, MessageCircle, Phone, Plus, Search, Video } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import './PhoneAppBase.css';
import './LineApp.css';

const INITIAL_USERS = [
    { id: 'xiao-wen',     image: 'xiao-wen.png',    name: '小文',     latestMessage: '那個人可能就是你。',     time: '18:15', unreadCount: 2 },
    { id: 'ya-ting',      image: 'ya-ting.jpg',     name: '雅婷',     latestMessage: '週末要不要一起吃飯？',     time: '16:42', unreadCount: 3 },
    { id: 'government',   image: 'Government.jpg',  name: 'AI領航青年數位工具',   latestMessage: '🔗 帳號綁定: 為了讓您之後可以快速查詢申請進度，請先完成身分綁定。', time: '昨天',  unreadCount: 1 },
    { id: 'zhou-yu-chen', image: 'zhou-yuchen.png', name: '周宇辰❤️', latestMessage: '周宇辰收回了一則訊息。', time: '21:18', unreadCount: 1 },
    { id: 'dad',          image: 'dad.jpg',              name: '爸爸',     latestMessage: '到家記得說一聲',           time: '昨天',  unreadCount: 0 },
    { id: 'hui-ling',     image: null,              name: '惠玲',     latestMessage: '照片我晚點傳給你',         time: '星期三', unreadCount: 0 },
    { id: 'landlord-lin', image: null,              name: '林先生',   latestMessage: '這個月房租已收到',         time: '星期二', unreadCount: 0 },
    { id: 'kevin',        image: null,              name: 'Kevin',    latestMessage: '哈哈沒問題',               time: '星期一', unreadCount: 0 },
 ];

// 周宇辰的劇情對話。isMine 為 true 表示安晴傳送；revoked 表示可點擊查看的收回訊息。
const CONVERSATIONS = {
    'zhou-yu-chen': [
        { id: 'z1', date: '7月1日 21:18｜情侶快問快答', text: '寶貝，我們來玩情侶快問快答。\n看看我們到底有多了解彼此。', isMine: false, time: '21:18' },
        { id: 'z2', date: '7月1日 21:18｜情侶快問快答', text: '好啊，你先問😂', isMine: true, time: '21:19', read: true },
        { id: 'z3', date: '7月1日 21:18｜情侶快問快答', text: '妳第一隻寵物叫什麼名字？', isMine: false, time: '21:19' },
        { id: 'z4', date: '7月1日 21:18｜情侶快問快答', text: '布丁。', isMine: true, time: '21:20', read: true },
        { id: 'z5', date: '7月1日 21:18｜情侶快問快答', text: '就想更了解妳啊。\n那錄一段「我最喜歡周宇辰」給我聽。', isMine: false, time: '21:20' },
        { id: 'z6', date: '7月1日 21:18｜情侶快問快答', text: '【語音訊息 5 秒】', isMine: true, time: '21:21', read: true, type: 'voice' },
        { id: 'z7', date: '7月1日 21:18｜情侶快問快答', text: '好可愛，我要一直留著❤️', isMine: false, time: '21:21' },
        { id: 'z8', date: '7月2日 20:46｜寄送禮物', text: '我準備了一個驚喜要寄給妳。\n把妳的全名、電話和地址給我。', isMine: false, time: '20:46' },
        { id: 'z9', date: '7月2日 20:46｜寄送禮物', text: '不能寄到超商嗎？', isMine: true, time: '20:47', read: true },
        { id: 'z10', date: '7月2日 20:46｜寄送禮物', text: '這個只能宅配。\n我是妳男朋友，妳還怕我知道嗎？', isMine: false, time: '20:47' },
        { id: 'z11', date: '7月2日 20:46｜寄送禮物', text: '好吧，你不要亂用喔。', isMine: true, time: '20:48', read: true },
        { id: 'z12', date: '7月2日 20:46｜寄送禮物', text: '陳安晴\n09XX-XXX-XXX\n新竹市○○路○○號', isMine: true, time: '20:49', read: true },
        { id: 'z13', date: '7月2日 20:46｜寄送禮物', text: '收到，等我的驚喜❤️', isMine: false, time: '20:50' },
        { id: 'z14', date: '7月2日 21:12｜員工旅遊', text: '對了，我們公司下個月有員工旅遊，可以免費帶一位家屬。\n我想帶妳一起去沖繩。', isMine: false, time: '21:12' },
        { id: 'z15', date: '7月2日 21:12｜員工旅遊', text: '真的假的！我可以去嗎🥹', isMine: true, time: '21:13', read: true },
        { id: 'z16', date: '7月2日 21:12｜員工旅遊', text: '當然可以。\n但公司今天要先登記保險資料，妳把身分證正反面拍給我。', isMine: false, time: '21:13' },
        { id: 'z17', date: '7月2日 21:12｜員工旅遊', text: '為什麼連背面也要？', isMine: true, time: '21:14', read: true },
        { id: 'z18', date: '7月2日 21:12｜員工旅遊', text: '人資要核對身分啊。\n名額快滿了，今天沒有交就來不及了。', isMine: false, time: '21:14' },
        { id: 'z19', date: '7月2日 21:12｜員工旅遊', text: '不能只給身分證字號嗎？', isMine: true, time: '21:15', read: true },
        { id: 'z20', date: '7月2日 21:12｜員工旅遊', text: '妳不相信我嗎？\n我只是想帶妳一起出去玩。', isMine: false, time: '21:15' },
        { id: 'z21', date: '7月2日 21:12｜員工旅遊', text: '好啦，你不要傳給別人喔。', isMine: true, time: '21:16', read: true },
        { id: 'z22', date: '7月2日 21:12｜員工旅遊', text: '【身分證正面照片】\n【身分證背面照片】', isMine: true, time: '21:17', read: true, type: 'attachment' },
        { id: 'z23', date: '7月2日 21:12｜員工旅遊', text: '收到了，我現在就幫妳登記❤️', isMine: false, time: '21:17' },
        { id: 'z24', date: '7月2日 21:12｜員工旅遊', revoked: true, isMine: false, time: '21:18' },
        { id: 'z25', date: '7月2日 22:03｜HeartSync戀愛測驗', text: '寶貝，我剛剛發現一個超準的AI戀愛測驗。\n它可以分析我們的照片和聲音，算出契合度。', isMine: false, time: '22:03' },
        { id: 'z26', date: '7月2日 22:03｜HeartSync戀愛測驗', text: '感覺很好玩，叫什麼？', isMine: true, time: '22:04', read: true },
        { id: 'z27', date: '7月2日 22:03｜HeartSync戀愛測驗', text: 'HeartSync。\n我已經填完了，現在只差妳。', isMine: false, time: '22:04' },
        { id: 'z28', date: '7月2日 22:03｜HeartSync戀愛測驗', link: true, isMine: false, time: '22:05' },
        { id: 'z29', date: '7月2日 22:03｜HeartSync戀愛測驗', text: '這個網站安全嗎？', isMine: true, time: '22:06', read: true },
        { id: 'z30', date: '7月2日 22:03｜HeartSync戀愛測驗', text: '當然啊，我自己也用了。\n只是戀愛測驗，不會怎樣啦。', isMine: false, time: '22:06' },
    ],
    'xiao-wen': [
        { id: 'w1', date: '7月4日 17:42｜你還好嗎？', text: '安晴，你現在方便講話嗎？', isMine: false, time: '17:42' },
        { id: 'w2', date: '7月4日 17:42｜你還好嗎？', text: '怎麼了？我剛下班。', isMine: true, time: '17:43', read: true },
        { id: 'w3', date: '7月4日 17:42｜你還好嗎？', text: '我不是要嚇你，但我剛剛在咖啡廳看到一個很像周宇辰的人。', isMine: false, time: '17:43' },
        { id: 'w4', date: '7月4日 17:42｜你還好嗎？', text: '他不是說今天要陪媽媽回診嗎？', isMine: true, time: '17:44', read: true },
        { id: 'w5', date: '7月4日 17:42｜你還好嗎？', text: '對，所以我才覺得怪。旁邊還坐了一個女生。', isMine: false, time: '17:44' },
        { id: 'w6', date: '7月4日 17:42｜你還好嗎？', text: '也許只是朋友吧。', isMine: true, time: '17:45', read: true },
        { id: 'w7', date: '7月4日 17:42｜你還好嗎？', text: '拜託，你每次都先幫他找理由。', isMine: false, time: '17:45' },
        { id: 'w8', date: '7月4日 17:42｜你還好嗎？', text: '我沒有啦……只是還沒搞清楚。', isMine: true, time: '17:46', read: true },
        { id: 'w9', date: '7月4日 17:42｜你還好嗎？', text: '我知道。可是你這幾天明明都怪怪的，訊息也一直盯著看。', isMine: false, time: '17:46' },
        { id: 'w10', date: '7月4日 17:42｜你還好嗎？', text: '他最近真的很忙。', isMine: true, time: '17:47', read: true },
        { id: 'w11', date: '7月4日 17:42｜你還好嗎？', text: '忙到連一句晚安都沒有，卻有空發限動？小妞，這題我會。', isMine: false, time: '17:48' },
        { id: 'w12', date: '7月4日 17:42｜你還好嗎？', text: '你不要用那個語氣啦。', isMine: true, time: '17:48', read: true },
        { id: 'w13', date: '7月4日 17:42｜你還好嗎？', text: '好好好，我收斂。但你答應我，不要一個人亂想。', isMine: false, time: '17:49' },
        { id: 'w14', date: '7月4日 17:42｜你還好嗎？', text: '嗯。', isMine: true, time: '17:49', read: true },
        { id: 'w15', date: '7月4日 17:42｜你還好嗎？', text: '要不要我現在過去找你？我可以帶鹹酥雞，還有你愛喝的無糖青。', isMine: false, time: '17:50' },
        { id: 'w16', date: '7月4日 17:42｜你還好嗎？', text: '你不是晚上要跟家人吃飯？', isMine: true, time: '17:51', read: true },
        { id: 'w17', date: '7月4日 17:42｜你還好嗎？', text: '家人每天都能見，你失戀預備役比較急。', isMine: false, time: '17:51' },
        { id: 'w18', date: '7月4日 17:42｜你還好嗎？', text: '誰失戀預備役……', isMine: true, time: '17:52', read: true },
        { id: 'w19', date: '7月4日 17:42｜你還好嗎？', text: '好，不說這個。反正不管發生什麼，我都站你這邊。', isMine: false, time: '17:52' },
        { id: 'w20', date: '7月4日 17:42｜你還好嗎？', text: '謝謝你，小文。', isMine: true, time: '17:53', read: true },
        { id: 'w21', date: '7月4日 18:08｜一張照片', text: '等一下，我剛剛整理照片時發現這張。', isMine: false, time: '18:08' },
        { id: 'w22', date: '7月4日 18:08｜一張照片', text: '你傳了什麼？', isMine: true, time: '18:09', read: true },
        { id: 'w23', date: '7月4日 18:08｜一張照片', text: '我沒有拍到正臉，但你自己看外套跟手錶，是不是很像他？', isMine: false, time: '18:10' },
        { id: 'w24', date: '7月4日 18:08｜一張照片', text: '……好像真的是。', isMine: true, time: '18:11', read: true },
        { id: 'w25', date: '7月4日 18:08｜一張照片', text: '先別衝去問他，深呼吸。你想怎麼做我都陪你。', isMine: false, time: '18:11' },
        { id: 'w26', date: '7月4日 18:08｜一張照片', text: '我想先問清楚。', isMine: true, time: '18:12', read: true },
        { id: 'w27', date: '7月4日 18:08｜一張照片', text: '可以，但不要被他三兩句就哄過去。把你在意的事講完。', isMine: false, time: '18:12' },
        { id: 'w28', date: '7月4日 18:08｜一張照片', text: '好。', isMine: true, time: '18:13', read: true },
        { id: 'w29', date: '7月4日 18:08｜一張照片', text: '還有，今天晚上手機不要靜音。我會等你回報。', isMine: false, time: '18:14' },
        { id: 'w30', date: '7月4日 18:08｜一張照片', text: '那個人可能就是你。', isMine: false, time: '18:15' },
    ],
};

const IMAGE_MODULES = import.meta.glob('./LineUserImage/*.{png,jpg,jpeg,webp,gif}', { eager: true, import: 'default', query: '?url' });
const LINE_IMAGES = Object.fromEntries(Object.entries(IMAGE_MODULES).map(([path, url]) => [path.split('/').pop(), url]));

const IDENTITY_CARD_PHOTOS = [
    { id: 'front', label: '身分證正面照片', guide: 'id-card-front' },
    { id: 'back', label: '身分證背面照片', guide: 'id-card-back' },
];

function LineAvatar({ image, name }) {
    const src = LINE_IMAGES[image];
    if (src) return <img className="line-avatar" src={src} alt={`${name} 的大頭貼`} />;
    return <span className="line-avatar line-avatar--fallback" aria-label={`${name} 的大頭貼`}>{name.slice(0, 1)}</span>;
}

function LineApp({ onHome, onFirstUserOpened, onHeartSyncOpen, onIdentityCardGuideOpen }) {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isRevokedMessageVisible, setIsRevokedMessageVisible] = useState(false);
    const messageListRef = useRef(null);
    const selectedUser = useMemo(() => users.find((user) => user.id === selectedUserId), [selectedUserId, users]);

    useEffect(() => {
        if (!selectedUserId || !messageListRef.current) return undefined;
        const timeoutId = window.setTimeout(() => {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [selectedUserId]);

    const openConversation = (userId) => {
        setUsers((currentUsers) => currentUsers.map((user) => (user.id === userId ? { ...user, unreadCount: 0 } : user)));
        setSelectedUserId(userId);
        setIsRevokedMessageVisible(false);
        if (userId === INITIAL_USERS[0].id) onFirstUserOpened?.();
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
                <div className="line-app__message-list" ref={messageListRef}>
                    {messages.map((message) => {
                        const showDate = message.date !== previousDate;
                        previousDate = message.date;
                        return (
                            <div className="line-message-group" key={message.id}>
                                {showDate && <p className="line-message__date">{message.date}</p>}
                                {message.revoked ? (
                                    <div className="line-revoked"><span>周宇辰收回了一則訊息。</span><button type="button" onClick={() => setIsRevokedMessageVisible((visible) => !visible)}>查看已收回訊息</button>{isRevokedMessageVisible && <p>A17資料已補齊。</p>}</div>
                                ) : message.link ? (
                                    <div className="line-heart-sync-link"><b>HeartSync｜測出你們的戀愛契合度</b><button type="button" onClick={onHeartSyncOpen}>開始測驗</button></div>
                                ) : message.id === 'z22' && selectedUser.id === 'zhou-yu-chen' ? (
                                    <div className="line-message" data-mine={message.isMine}>
                                        <div className="line-identity-photos">
                                            {IDENTITY_CARD_PHOTOS.map((photo) => (
                                                <button
                                                    className="line-identity-photo"
                                                    data-guide={photo.guide}
                                                    key={photo.id}
                                                    type="button"
                                                    onClick={onIdentityCardGuideOpen}
                                                >
                                                    <Image size={18} />
                                                    <span>{photo.label}</span>
                                                    <small>點擊查看</small>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="line-message__meta">{message.isMine && <span>{message.read ? '已讀' : '未讀'}</span>}<time>{message.time}</time></div>
                                    </div>
                                ) : (
                                    <div className="line-message" data-mine={message.isMine}>
                                        <div className="line-message__bubble" data-type={message.type}>{message.text && <p>{message.text}</p>}</div>
                                        <div className="line-message__meta">{message.isMine && <span>{message.read ? '已讀' : '未讀'}</span>}<time>{message.time}</time></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="line-app__composer" aria-label="傳送訊息工具列"><button type="button" aria-label="更多功能"><Plus size={20} /></button><button type="button" aria-label="拍照"><Camera size={20} /></button><button type="button" aria-label="選擇圖片"><Image size={20} /></button><div className="line-app__input" aria-label="訊息輸入框">Aa</div></div>
            </section>
        );
    }

    return (
        <section className="phone-page phone-page--line">
            <div className="line-app__search" aria-hidden="true"><Search size={16} /><span>搜尋</span></div>
            <div className="line-app__user-list" aria-label="LINE 聊天列表">
                {users.map((user) => <button className="line-user" data-guide={user.id === INITIAL_USERS[0].id ? 'line-first-user' : undefined} key={user.id} type="button" onClick={() => openConversation(user.id)}><LineAvatar image={user.image} name={user.name} /><div className="line-user__content"><b>{user.name}</b><span>{user.latestMessage}</span></div><div className="line-user__meta"><time>{user.time}</time>{user.unreadCount > 0 && <span>{user.unreadCount}</span>}</div></button>)}
            </div>
        </section>
    );
}

export default LineApp;
