import { Link, NavLink } from 'react-router-dom';
import './TopNavigation.css';

const menus = [
    { label: '案件服務', items: ['案件進度查詢', '線上案件申報', '歷史案件紀錄'] },
    { label: '便民服務', items: ['LINE 帳號綁定說明', '常見申辦問答 (FAQ)', '處理時限公告'] },
    { label: '公告訊息', items: ['最新消息', '系統維護公告'] },
];

const caseProgressItem = '案件進度查詢';

function TopNavigation() {
    return (
        <header className="site-header">
            <div className="utility-bar">
                <div className="utility-inner">
                    <span>新竹市政府資訊局</span>
                    <div className="utility-links" aria-label="輔助功能">
                        <a href="#accessibility">◎</a>
                        <a href="#facebook">f</a>
                        <a href="#twitter">t</a>
                        <a href="#line">LINE</a>
                        <span className="utility-divider" />
                        <a href="#language">EN</a>
                        <a href="#font-size">A⌄</a>
                        <a href="#search">⌕</a>
                    </div>
                </div>
            </div>

            <div className="nav-shell">
                {/* Logo 區 */}
                <Link className="brand" to="/" aria-label="數位服務首頁">
                    <span className="brand-mark">
                        m<span>o</span>d<span>a</span>
                    </span>
                    <span className="brand-copy">
                        <b>數位案件服務</b>
                        <small>Digital Service Portal</small>
                    </span>
                </Link>

                {/* 主選單清單 */}
                <nav className="main-nav" aria-label="主選單">
                    {menus.map((menu) => (
                        <div className="nav-dropdown" key={menu.label}>
                            <NavLink
                                to={`/${encodeURIComponent(menu.label)}`}
                                className="nav-trigger"
                            >
                                {menu.label}
                                <span>▾</span>
                            </NavLink>

                            {/* 下拉選單 */}
                            <div className="dropdown-panel">
                                {menu.items.map((item) => (
                                    <Link
                                        key={item}
                                        to={
                                            item === caseProgressItem
                                                ? '/case-progress'
                                                : `/${encodeURIComponent(item)}`
                                        }
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    <NavLink 
                        to="/about" 
                        className="nav-trigger standalone"
                    >
                        關於我們
                    </NavLink>

                </nav>
            </div>
        </header>
    );
}


export default TopNavigation;
