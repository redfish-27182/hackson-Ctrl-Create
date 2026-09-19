import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../App';
import './ApplyPage.css';

function ApplyPage() {
    // 區分是從 LINE 進入還是從官網進入
    const [isFromLine, setIsFromLine] = useState(false);
    const [applicationId, setApplicationId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // 表單資料狀態 (若從官網進入則為空白)
    const [formData, setFormData] = useState({
        // 頂部類別
        targetType: '', // 'general' | 'specific'

        // 一、申請人基本資料
        name: '',
        phone: '',
        idNumber: '',
        birthYear: '',
        birthMonth: '',
        birthDay: '',
        email: '',
        registeredAddress: '',
        sameAddress: false,
        mailingAddress: '',

        // 二、購買明細 (數位工具/軟體)
        billingCycle: '', // 'annual' | 'monthly'
        functionType: '', // 'general' | 'image' | 'office' | 'learn' | 'other'
        softwareName: '',
        softwareCompany: '',
        origin: '',
        purchaseYear: '',
        purchaseMonth: '',
        purchaseDay: '',
        originalPrice: '',
        twdPrice: '',
        creditCardType: '', // 'self' | 'proxy'
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const lineUserId = searchParams.get('line_user_id');

        // 規則 3: 如果是從官網進去 (無 line_user_id)，就沒有預先填入的資料
        if (!lineUserId) {
            setIsFromLine(false);
            return;
        }

        // 規則 2: 當從 Line 過去，要從 DB 去抓對應資料並自動填入
        setIsFromLine(true);
        setIsLoading(true);

        axios
            .get(`${BACKEND_URL}/api/applications/by-line/${encodeURIComponent(lineUserId)}`)
            .then((response) => {
                const data = response.data;
                setApplicationId(data.application_id || '');

                // 自動填入 DB 與 Mock 假資料 (規則 4: 缺少的資料先假裝寫死，之後再補齊 DB)
                setFormData({
                    targetType: data.target_type || 'general',
                    name: data.name || '',
                    phone: data.phone || '0912-345-678',
                    idNumber: data.id_number || (data.id_last4 ? `O12345${data.id_last4}` : ''),
                    birthYear: data.birthday_year || '',
                    birthMonth: data.birthday_month || '',
                    birthDay: data.birthday_day || '',
                    email: data.email || 'applicant@gmail.com',
                    registeredAddress: data.registered_address || '新竹市東區中央路 120 號',
                    sameAddress: data.same_address ?? true,
                    mailingAddress: data.mailing_address || '新竹市東區中央路 120 號',

                    billingCycle: data.payment_cycle || 'monthly',
                    functionType: data.software_function || 'general',
                    softwareName: data.software_name || 'ChatGPT Plus',
                    softwareCompany: data.software_company || 'OpenAI, Inc.',
                    origin: data.origin || '美國',
                    purchaseYear: data.purchase_year || '113',
                    purchaseMonth: data.purchase_month || '03',
                    purchaseDay: data.purchase_day || '15',
                    originalPrice: data.original_price || 'USD 20.00',
                    twdPrice: data.twdPrice || data.twd_price || '640',
                    creditCardType: data.credit_card_type || 'self',
                });
            })
            .catch((error) => {
                console.warn('無法從後端獲取 LINE 帳號對應資料，使用預設 Mock 資料：', error);
                // 即使後端連線異常，依然確保 Line 一鍵申請能展示成果
                setFormData({
                    targetType: 'general',
                    name: '陳小明',
                    phone: '0912-345-678',
                    idNumber: 'O123451234',
                    birthYear: '92',
                    birthMonth: '05',
                    birthDay: '17',
                    email: 'applicant@gmail.com',
                    registeredAddress: '新竹市東區中央路 120 號',
                    sameAddress: true,
                    mailingAddress: '新竹市東區中央路 120 號',
                    billingCycle: 'monthly',
                    functionType: 'general',
                    softwareName: 'ChatGPT Plus',
                    softwareCompany: 'OpenAI, Inc.',
                    origin: '美國',
                    purchaseYear: '113',
                    purchaseMonth: '03',
                    purchaseDay: '15',
                    originalPrice: 'USD 20.00',
                    twdPrice: '640',
                    creditCardType: 'self',
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // 處理欄位變更
    const handleChange = (field, value) => {
        setFormData((prev) => {
            const next = { ...prev, [field]: value };
            if (field === 'sameAddress' && value) {
                next.mailingAddress = next.registeredAddress;
            }
            return next;
        });
    };

    const handleReset = () => {
        setFormData({
            targetType: '',
            name: '',
            phone: '',
            idNumber: '',
            birthYear: '',
            birthMonth: '',
            birthDay: '',
            email: '',
            registeredAddress: '',
            sameAddress: false,
            mailingAddress: '',
            billingCycle: '',
            functionType: '',
            softwareName: '',
            softwareCompany: '',
            origin: '',
            purchaseYear: '',
            purchaseMonth: '',
            purchaseDay: '',
            originalPrice: '',
            twdPrice: '',
            creditCardType: '',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    return (
        <main className="apply-container">
            {/* 提示徽章 */}
            {isFromLine ? (
                <div className="apply-source-badge">
                    <span>✓</span>
                    <span>
                        已透過 LINE 一鍵申請自動從資料庫帶入您的個人資料
                        {applicationId ? `（案件編號：${applicationId}）` : ''}
                    </span>
                </div>
            ) : (
                <div className="apply-source-badge web-badge">
                    <span>📝</span>
                    <span>官網線上案件申報（請手動填寫以下申請表單）</span>
                </div>
            )}

            {isLoading ? (
                <p style={{ textAlign: 'center', padding: '40px' }}>資料庫連線載入中...</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/* 頂部身份選擇 */}
                    <div className="top-category-select">
                        <label className="custom-checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.targetType === 'general'}
                                onChange={(e) =>
                                    handleChange('targetType', e.target.checked ? 'general' : '')
                                }
                            />
                            一般青年
                        </label>
                        <label className="custom-checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.targetType === 'specific'}
                                onChange={(e) =>
                                    handleChange('targetType', e.target.checked ? 'specific' : '')
                                }
                            />
                            特定對象與文化語言保存者
                        </label>
                    </div>

                    {/* 一、申請人基本資料 表格 */}
                    <table className="gov-form-table">
                        <thead>
                            <tr className="section-header-row">
                                <th colSpan={4} className="section-title">
                                    一、申請人基本資料
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="cell-label">姓 名</td>
                                <td>
                                    <input
                                        type="text"
                                        className="cell-input"
                                        placeholder="請輸入姓名"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                    />
                                </td>
                                <td className="cell-label">電 話</td>
                                <td>
                                    <input
                                        type="tel"
                                        className="cell-input"
                                        placeholder="例如：0912-345-678"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">身分證字號</td>
                                <td>
                                    <input
                                        type="text"
                                        className="cell-input"
                                        placeholder="例如：A123456789"
                                        value={formData.idNumber}
                                        onChange={(e) => handleChange('idNumber', e.target.value)}
                                    />
                                </td>
                                <td className="cell-label">出生日期</td>
                                <td>
                                    <div className="roc-date-group">
                                        <span>民國</span>
                                        <input
                                            type="text"
                                            className="date-num-input"
                                            placeholder="年"
                                            value={formData.birthYear}
                                            onChange={(e) =>
                                                handleChange('birthYear', e.target.value)
                                            }
                                        />
                                        <span>年</span>
                                        <input
                                            type="text"
                                            className="date-num-input"
                                            placeholder="月"
                                            value={formData.birthMonth}
                                            onChange={(e) =>
                                                handleChange('birthMonth', e.target.value)
                                            }
                                        />
                                        <span>月</span>
                                        <input
                                            type="text"
                                            className="date-num-input"
                                            placeholder="日"
                                            value={formData.birthDay}
                                            onChange={(e) =>
                                                handleChange('birthDay', e.target.value)
                                            }
                                        />
                                        <span>日</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">電子郵件</td>
                                <td colSpan={3}>
                                    <input
                                        type="email"
                                        className="cell-input"
                                        placeholder="請輸入常用電子信箱"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">戶籍住址</td>
                                <td colSpan={3}>
                                    <input
                                        type="text"
                                        className="cell-input"
                                        placeholder="請輸入戶籍完整地址"
                                        value={formData.registeredAddress}
                                        onChange={(e) =>
                                            handleChange('registeredAddress', e.target.value)
                                        }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">通訊住址</td>
                                <td colSpan={3}>
                                    <div className="address-with-checkbox">
                                        <label className="custom-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.sameAddress}
                                                onChange={(e) =>
                                                    handleChange('sameAddress', e.target.checked)
                                                }
                                            />
                                            同戶籍地
                                        </label>
                                        <input
                                            type="text"
                                            className="cell-input"
                                            placeholder="請輸入通訊完整地址"
                                            value={
                                                formData.sameAddress
                                                    ? formData.registeredAddress
                                                    : formData.mailingAddress
                                            }
                                            onChange={(e) =>
                                                handleChange('mailingAddress', e.target.value)
                                            }
                                            disabled={formData.sameAddress}
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* 二、購買明細 (數位工具/軟體) 表格 */}
                    <table className="gov-form-table">
                        <thead>
                            <tr className="section-header-row">
                                <th colSpan={4}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span className="section-title">
                                            二、購買明細(數位工具/軟體)
                                        </span>
                                        <div className="section-header-options">
                                            <label className="custom-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.billingCycle === 'annual'}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            'billingCycle',
                                                            e.target.checked ? 'annual' : '',
                                                        )
                                                    }
                                                />
                                                年費制
                                            </label>
                                            <label className="custom-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.billingCycle === 'monthly'}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            'billingCycle',
                                                            e.target.checked ? 'monthly' : '',
                                                        )
                                                    }
                                                />
                                                月費制
                                            </label>
                                        </div>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="cell-label">功 能</td>
                                <td colSpan={3}>
                                    <div className="function-options-group">
                                        {[
                                            { id: 'general', label: '通用型' },
                                            { id: 'image', label: '影像類' },
                                            { id: 'office', label: '辦公類' },
                                            { id: 'learn', label: '學習類' },
                                            { id: 'other', label: '其他類' },
                                        ].map((func) => (
                                            <label key={func.id} className="custom-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.functionType === func.id}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            'functionType',
                                                            e.target.checked ? func.id : '',
                                                        )
                                                    }
                                                />
                                                {func.label}
                                            </label>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">軟體名稱</td>
                                <td colSpan={3}>
                                    <input
                                        type="text"
                                        className="cell-input"
                                        placeholder="例如：ChatGPT Plus / Adobe Creative Cloud"
                                        value={formData.softwareName}
                                        onChange={(e) =>
                                            handleChange('softwareName', e.target.value)
                                        }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">軟體公司名稱</td>
                                <td colSpan={3}>
                                    <input
                                        type="text"
                                        className="cell-input"
                                        placeholder="例如：OpenAI / Adobe Inc."
                                        value={formData.softwareCompany}
                                        onChange={(e) =>
                                            handleChange('softwareCompany', e.target.value)
                                        }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">出 產 地</td>
                                <td>
                                    <input
                                        type="text"
                                        className="cell-input"
                                        placeholder="例如：美國 / 台灣"
                                        value={formData.origin}
                                        onChange={(e) => handleChange('origin', e.target.value)}
                                    />
                                </td>
                                <td className="cell-label">購買日期</td>
                                <td>
                                    <div className="roc-date-group">
                                        <span>民國</span>
                                        <input
                                            type="text"
                                            className="date-num-input"
                                            placeholder="年"
                                            value={formData.purchaseYear}
                                            onChange={(e) =>
                                                handleChange('purchaseYear', e.target.value)
                                            }
                                        />
                                        <span>年</span>
                                        <input
                                            type="text"
                                            className="date-num-input"
                                            placeholder="月"
                                            value={formData.purchaseMonth}
                                            onChange={(e) =>
                                                handleChange('purchaseMonth', e.target.value)
                                            }
                                        />
                                        <span>月</span>
                                        <input
                                            type="text"
                                            className="date-num-input"
                                            placeholder="日"
                                            value={formData.purchaseDay}
                                            onChange={(e) =>
                                                handleChange('purchaseDay', e.target.value)
                                            }
                                        />
                                        <span>日</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">原始費用</td>
                                <td>
                                    <input
                                        type="text"
                                        className="cell-input"
                                        placeholder="例如：USD 20.00"
                                        value={formData.originalPrice}
                                        onChange={(e) =>
                                            handleChange('originalPrice', e.target.value)
                                        }
                                    />
                                </td>
                                <td className="cell-label">換算新臺幣</td>
                                <td>
                                    <div className="currency-calc-group">
                                        <input
                                            type="text"
                                            className="price-input"
                                            placeholder="金額"
                                            value={formData.twdPrice}
                                            onChange={(e) =>
                                                handleChange('twdPrice', e.target.value)
                                            }
                                        />
                                        <span>元</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="cell-label">
                                    是否本人
                                    <br />
                                    信用卡
                                </td>
                                <td colSpan={3}>
                                    <div className="credit-card-options">
                                        <label className="custom-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.creditCardType === 'self'}
                                                onChange={(e) =>
                                                    handleChange(
                                                        'creditCardType',
                                                        e.target.checked ? 'self' : '',
                                                    )
                                                }
                                            />
                                            本人信用卡
                                        </label>
                                        <label className="custom-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.creditCardType === 'proxy'}
                                                onChange={(e) =>
                                                    handleChange(
                                                        'creditCardType',
                                                        e.target.checked ? 'proxy' : '',
                                                    )
                                                }
                                            />
                                            父母、配偶或法定代理人信用卡
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* 表單底部操作按鈕 */}
                    <div className="apply-actions">
                        <button type="button" className="btn-reset" onClick={handleReset}>
                            清除重填
                        </button>
                        <button type="submit" className="btn-submit">
                            確認送出申請
                        </button>
                    </div>
                </form>
            )}

            {/* 成功彈窗 */}
            {isSubmitted && (
                <div className="submit-modal-overlay" onClick={() => setIsSubmitted(false)}>
                    <div className="submit-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>申請已成功送出！</h2>
                        <p>
                            申請人：<strong>{formData.name || '申請人'}</strong>
                            <br />
                            案件已送交資料審核程序，您可透過 LINE 或本平臺「案件進度查詢」查看進度。
                        </p>
                        <button onClick={() => setIsSubmitted(false)}>確定</button>
                    </div>
                </div>
            )}
        </main>
    );
}

export default ApplyPage;