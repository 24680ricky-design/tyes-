export type View = 'HOME' | 'LEARN' | 'FIND' | 'SHOP' | 'SETTINGS';

export interface CoinType {
    value: number;
    label: string;
    type: 'coin' | 'bill';
    colorDescription: string;
    imageUrl?: string; // Optional Wikimedia URL
    customImage?: string; // User uploaded Base64
    customIntro?: string; // Customized voice intro text for this specific coin
}

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string; // URL or Base64
    isCustom?: boolean;
}

export interface VoiceSettings {
    correct: string;
    wrong_try_again: string; // Used in find mode: "This is X. Please find Y."
    find_prompt: string;     // "Please find {label}"
    learn_intro: string;     // "This is {label}. It is {color}."
    shop_welcome: string;    // "I want to buy {name}, {price} dollars."
    shop_total: string;      // "{total} dollars" (Wallet addition)
    shop_shortage: string;   // "Still short {diff} dollars."
    shop_over: string;       // "Paid too much..."
    shop_change_mode_prompt: string; // "Please take away {price} dollars..."
    shop_change_complete: string;    // "Paid! Remaining {change} is your change."
}

export interface AppSettings {
    footerText: string;
    teacherInfoTitle: string;
    teacherInfoContent: string; // HTML string supported
    voice: VoiceSettings;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
    correct: "答對了！好棒！",
    wrong_try_again: "這是{current}。請找{target}",
    find_prompt: "請找出 {label}",
    learn_intro: "這是{label}，它是{color}的。",
    shop_welcome: "我要買{name}，{price}元",
    shop_total: "{total}元",
    shop_shortage: "還差 {diff} 元",
    shop_over: "付太多了，試試看能不能付剛好？",
    shop_change_mode_prompt: "付太多了，我們來練習找錢。請拿走要付的{price}元。",
    shop_change_complete: "付好了！剩下{change}元是找的錢。"
};

export const DEFAULT_SETTINGS: AppSettings = {
    footerText: "© 2025 TYES 特教教材研發",
    teacherInfoTitle: "教師教學重點提示",
    teacherInfoContent: `
        <ul class="list-disc list-inside space-y-2">
            <li><strong>無挫折回饋：</strong>所有錯誤皆提供溫和語音引導，避免使用刺耳音效。</li>
            <li><strong>真實情境：</strong>使用擬真錢幣與真實商品圖片，促進類化能力。</li>
            <li><strong>功能性數學：</strong>購物遊戲包含「付剛好」與「找錢」邏輯，訓練減法運算與貨幣組合。</li>
            <li><strong>客製化語音：</strong>您可以在後台修改所有遊戲中的語音提示內容。</li>
        </ul>
    `,
    voice: DEFAULT_VOICE_SETTINGS
};

export const DEFAULT_COINS: CoinType[] = [
    { value: 1, label: "1元", type: 'coin', colorDescription: "銅黃色", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/1_New_Taiwan_Dollar_1981_Reverse.jpg" },
    { value: 5, label: "5元", type: 'coin', colorDescription: "銀色", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/82/5_New_Taiwan_Dollar_1981_Reverse.jpg" },
    { value: 10, label: "10元", type: 'coin', colorDescription: "銀白色", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e6/10_New_Taiwan_Dollar_2011_Reverse.jpg" },
    { value: 50, label: "50元", type: 'coin', colorDescription: "金色", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/50_New_Taiwan_Dollar_2002_Reverse.jpg" },
    { value: 100, label: "100元", type: 'bill', colorDescription: "紅色紙鈔", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7e/100_New_Taiwan_Dollar_2000_Obverse.jpg" },
    { value: 500, label: "500元", type: 'bill', colorDescription: "咖啡色紙鈔", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/77/500_New_Taiwan_Dollar_2004_Obverse.jpg" },
    { value: 1000, label: "1000元", type: 'bill', colorDescription: "藍色紙鈔", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/05/1000_New_Taiwan_Dollar_2004_Obverse.jpg" },
];

export const DEFAULT_PRODUCTS: Product[] = [
    { id: 'p1', name: "漢堡", price: 45, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
    { id: 'p2', name: "牛奶", price: 32, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80" },
    { id: 'p3', name: "玩具車", price: 120, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&q=80" },
    { id: 'p4', name: "筆記本", price: 15, image: "https://images.unsplash.com/photo-1531346878377-a513bc95ba0d?w=400&q=80" },
    { id: 'p5', name: "彩色筆", price: 85, image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80" },
];