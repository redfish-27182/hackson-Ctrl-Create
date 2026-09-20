import { ChevronLeft, FileText, Heart, Mail, Search, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import './PhoneAppBase.css';
import './GmailApp.css';

// Gmail 用戶列表資料：只管理寄件者、主旨、未讀狀態和對應的假頁面圖片。
const INITIAL_MAILS = [
    { id: 'heartsync', sender: 'HeartSync AI Report', subject: '您的 AI 戀愛契合度報告已完成', preview: '您與周宇辰的 AI 戀愛契合度為 96%。', time: '21:30', unread: true, icon: Heart, fakeImage:  'project-share.png'},
    { id: 'project-share', sender: '周宇辰（透過雲端文件）', subject: '「AI 領航青年計畫成功範本」已與您共用', preview: '宇辰已邀請您共同編輯文件。', time: '昨天', unread: true, icon: FileText, fakeImage:  'AI.png'},
    { id: 'course-reminder', sender: '數位學習平台', subject: '課程提醒：資安基礎測驗即將截止', preview: '請於本週五前完成線上測驗。', time: '昨天', unread: false, icon: Mail, fakeImage: 'AI.png' },
    { id: 'cloud-storage', sender: 'Cloud Drive', subject: '你的雲端空間使用量通知', preview: '目前已使用 72% 的儲存空間。', time: '星期三', unread: false, icon: FileText, fakeImage: 'project-share.png' },
    { id: 'newsletter', sender: '城市生活週報', subject: '本週末活動精選', preview: '展覽、市集與音樂活動整理給你。', time: '星期二', unread: false, icon: Mail, fakeImage: 'AI.png' },
    { id: 'bank-notice', sender: '銀行帳務通知', subject: '本月信用卡帳單已產生', preview: '請於繳款截止日前確認帳單明細。', time: '星期一', unread: false, icon: Mail, fakeImage: 'project-share.png' },
    { id: 'shopping', sender: '購物平台', subject: '你收藏的商品正在限時優惠', preview: '部分商品即將恢復原價，快去看看。', time: '上週', unread: false, icon: Mail, fakeImage: 'AI.png' },
];

// 使用者將完成的假信件畫面放進 GmailFakeImage，並以 fakeImage 同名對應。
const FAKE_IMAGE_MODULES = import.meta.glob('./GmailFakeImage/*.{png,jpg,jpeg,webp,gif}', { eager: true, import: 'default', query: '?url' });
const FAKE_IMAGES = Object.fromEntries(Object.entries(FAKE_IMAGE_MODULES).map(([path, url]) => [path.split('/').pop(), url]));

function GmailApp({ onHome, onHeartSyncOpened }) {
    const [mails, setMails] = useState(INITIAL_MAILS);
    const [selectedMailId, setSelectedMailId] = useState(null);
    const selectedMail = useMemo(() => mails.find((mail) => mail.id === selectedMailId), [mails, selectedMailId]);

    // 開啟信件只清除列表粗體，內容畫面則完全由假頁面圖片提供。
    const openMail = (mailId) => {
        setMails((currentMails) => currentMails.map((mail) => (
            mail.id === mailId ? { ...mail, unread: false } : mail
        )));
        setSelectedMailId(mailId);
        if (mailId === 'heartsync') {
            window.setTimeout(() => onHeartSyncOpened?.(), 20);
        }
    };

    if (selectedMail) {
        const fakePageImage = FAKE_IMAGES[selectedMail.fakeImage];
        return (
            <section className="phone-page phone-page--gmail">
                <div className="gmail-fake-page">
                    {fakePageImage ? <img src={fakePageImage} alt={`${selectedMail.subject} 的假郵件頁面`} /> : <div className="gmail-fake-page__placeholder"><Mail size={54} /><b>等待圖片：{selectedMail.fakeImage}</b></div>}
                    {selectedMail.id === 'heartsync' && <div className="gmail-fake-page__image-bottom" data-guide="gmail-heartsync-image-bottom" />}
                    {/* 圖片左上角的小區域可回到 Gmail 列表。 */}
                    <button className="gmail-fake-page__back" 
                            type="button" 
                            aria-label="回到 Gmail 信件列表" 
                            onClick={() => setSelectedMailId(null)}>
                            {/* <ChevronLeft size={22} /> */}
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="phone-page phone-page--gmail">
            <div className="gmail-app__topbar">
                <button className="gmail-app__home" type="button" onClick={onHome}><ChevronLeft size={20} /></button>
                <b>Gmail</b>
                <Mail size={19} />
            </div>
            <div className="gmail-app__search" aria-hidden="true"><Search size={16} /><span>搜尋郵件</span></div>
            <div className="gmail-app__mail-list" aria-label="Gmail 信件列表">
                {mails.map((mail) => {
                    const Icon = mail.icon;
                    return (
                        <button className="gmail-mail" data-unread={mail.unread} key={mail.id} type="button" onClick={() => openMail(mail.id)}>
                            <span className="gmail-mail__avatar" data-mail={mail.id}><Icon size={21} /></span>
                            <div className="gmail-mail__content"><b>{mail.sender}</b><strong>{mail.subject}</strong><span>{mail.preview}</span></div>
                            <div className="gmail-mail__meta"><time>{mail.time}</time><Star size={18} /></div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export default GmailApp;
