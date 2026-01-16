
import React, { useState, useRef } from 'react';
import { Product, CoinType, AppSettings, DEFAULT_VOICE_SETTINGS } from '../types';
import Coin from './Coin';
import { speak } from '../utils/tts';
// Import GoogleGenAI for AI-powered content generation
import { GoogleGenAI } from "@google/genai";

interface SettingsProps {
    onClose: () => void;
    products: Product[];
    onUpdateProducts: (newProducts: Product[]) => void;
    coins: CoinType[];
    onUpdateCoins: (newCoins: CoinType[]) => void;
    appSettings: AppSettings;
    onUpdateAppSettings: (newSettings: AppSettings) => void;
}

type Tab = 'GENERAL' | 'PRODUCTS' | 'COINS' | 'VOICE';

const Settings: React.FC<SettingsProps> = ({ 
    onClose, 
    products, onUpdateProducts, 
    coins, onUpdateCoins,
    appSettings, onUpdateAppSettings 
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Product State
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState<number | ''>('');
    const [newItemImage, setNewItemImage] = useState<string | null>(null);
    const productFileInputRef = useRef<HTMLInputElement>(null);

    // --- AI Suggestions Handler using Gemini ---
    const handleGenerateAISuggestions = async () => {
        setIsGenerating(true);
        try {
            // Use Gemini 3 Pro for high-quality pedagogical reasoning
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: "你是一位資深的特教老師。請針對「台幣錢幣教學（1元, 5元, 10元, 50元, 100元, 500元, 1000元）」提供教學重點建議。請以 HTML 格式輸出，使用 <ul> 和 <li> 標籤，並包含 <strong> 強調重點。內容要實用、具備教育意義且適合特教學生。字數約 200-300 字。",
            });
            
            if (response.text) {
                // Remove potential markdown code block artifacts
                const cleanedHtml = response.text.replace(/```html|```/g, '').trim();
                handleSettingChange('teacherInfoContent', cleanedHtml);
                speak("教學重點已透過 AI 生成完畢");
            }
        } catch (error) {
            console.error("Gemini AI Generation failed:", error);
            alert("AI 生成失敗，請檢查 API 金鑰或網路連線。");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- General Handlers ---
    const handleSettingChange = (key: keyof AppSettings, value: any) => {
        onUpdateAppSettings({
            ...appSettings,
            [key]: value
        });
    };

    const handleVoiceChange = (key: keyof typeof DEFAULT_VOICE_SETTINGS, value: string) => {
        onUpdateAppSettings({
            ...appSettings,
            voice: {
                ...appSettings.voice,
                [key]: value
            }
        });
    };

    const resetVoiceSettings = () => {
        onUpdateAppSettings({
            ...appSettings,
            voice: DEFAULT_VOICE_SETTINGS
        });
    };

    // --- Product Handlers ---
    const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItemImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddProduct = () => {
        if (!newItemName || !newItemPrice || !newItemImage) return;

        const newProduct: Product = {
            id: Date.now().toString(),
            name: newItemName,
            price: Number(newItemPrice),
            image: newItemImage,
            isCustom: true
        };

        onUpdateProducts([...products, newProduct]);
        
        // Reset form
        setNewItemName('');
        setNewItemPrice('');
        setNewItemImage(null);
        if (productFileInputRef.current) productFileInputRef.current.value = '';
    };

    const handleDeleteProduct = (id: string) => {
        onUpdateProducts(products.filter(p => p.id !== id));
    };

    // --- Coin Handlers ---
    const handleCoinFileChange = (e: React.ChangeEvent<HTMLInputElement>, coinValue: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                const updatedCoins = coins.map(c => 
                    c.value === coinValue ? { ...c, customImage: base64 } : c
                );
                onUpdateCoins(updatedCoins);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoinIntroChange = (value: string, coinValue: number) => {
        const updatedCoins = coins.map(c => 
            c.value === coinValue ? { ...c, customIntro: value } : c
        );
        onUpdateCoins(updatedCoins);
    };

    const handleResetCoin = (coinValue: number) => {
        const updatedCoins = coins.map(c => 
            c.value === coinValue ? { ...c, customImage: undefined, customIntro: undefined } : c
        );
        onUpdateCoins(updatedCoins);
    };

    const handleResetAllCoins = () => {
         const updatedCoins = coins.map(c => ({ ...c, customImage: undefined, customIntro: undefined }));
         onUpdateCoins(updatedCoins);
    };

    const renderVoiceInput = (key: keyof typeof DEFAULT_VOICE_SETTINGS, label: string, exampleParams?: string) => (
        <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-slate-700">{label}</label>
                <button 
                    onClick={() => speak(appSettings.voice[key])}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                >
                    <i className="fas fa-volume-up mr-1"></i> 試聽
                </button>
            </div>
            <textarea 
                value={appSettings.voice[key]}
                onChange={(e) => handleVoiceChange(key, e.target.value)}
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                rows={2}
            />
            {exampleParams && (
                <p className="text-xs text-slate-500 mt-1">可用參數: {exampleParams}</p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                    <h2 className="text-2xl font-bold"><i className="fas fa-cog mr-2"></i>教學後台管理</h2>
                    <button onClick={onClose} className="text-white hover:text-blue-200">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
                    {[
                        { id: 'GENERAL', icon: 'sliders-h', label: '一般' },
                        { id: 'PRODUCTS', icon: 'shopping-basket', label: '商品' },
                        { id: 'COINS', icon: 'coins', label: '錢幣' },
                        { id: 'VOICE', icon: 'microphone-alt', label: '語音' },
                    ].map((tab) => (
                         <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex-1 py-4 px-2 text-center font-bold transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <i className={`fas fa-${tab.icon} mr-2`}></i> {tab.label}
                        </button>
                    ))}
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">
                    {activeTab === 'GENERAL' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-800">介面文字設定</h3>
                                    <button 
                                        onClick={handleGenerateAISuggestions}
                                        disabled={isGenerating}
                                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold text-white transition-all
                                            ${isGenerating ? 'bg-gray-400' : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 active:scale-95 shadow-md'}`}
                                    >
                                        <i className={`fas fa-magic mr-2 ${isGenerating ? 'animate-spin' : ''}`}></i>
                                        {isGenerating ? 'AI 生成中...' : 'AI 輔助生成教學重點'}
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">頁尾版權文字 (Footer)</label>
                                        <input 
                                            type="text" 
                                            value={appSettings.footerText}
                                            onChange={(e) => handleSettingChange('footerText', e.target.value)}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">首頁教師提示標題</label>
                                        <input 
                                            type="text" 
                                            value={appSettings.teacherInfoTitle}
                                            onChange={(e) => handleSettingChange('teacherInfoTitle', e.target.value)}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">首頁教師提示內容 (支援 HTML)</label>
                                        <textarea 
                                            value={appSettings.teacherInfoContent}
                                            onChange={(e) => handleSettingChange('teacherInfoContent', e.target.value)}
                                            className="w-full p-2 border rounded-lg h-48 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="請輸入內容..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">小撇步: 使用 &lt;li&gt; 包裹項目符號，&lt;strong&gt; 加粗文字。</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'VOICE' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="text-sm text-blue-800">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    您可以修改遊戲中的語音指令與回饋。使用 <code>{'{參數}'}</code> 來代表變動的數值。
                                </div>
                                <button 
                                    onClick={resetVoiceSettings}
                                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-bold whitespace-nowrap ml-2"
                                >
                                    還原預設
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <h3 className="text-lg font-bold text-slate-700 border-b pb-2">通用回饋</h3>
                                {renderVoiceInput('correct', '答對時')}
                                {renderVoiceInput('wrong_try_again', '找找看-答錯提示', '{current}, {target}')}
                                {renderVoiceInput('find_prompt', '找找看-出題', '{label}')}
                                
                                <h3 className="text-lg font-bold text-slate-700 border-b pb-2 pt-4">認識錢幣</h3>
                                {renderVoiceInput('learn_intro', '錢幣介紹', '{label}, {color}')}
                                
                                <h3 className="text-lg font-bold text-slate-700 border-b pb-2 pt-4">購物遊戲</h3>
                                {renderVoiceInput('shop_welcome', '歡迎與出題', '{name}, {price}')}
                                {renderVoiceInput('shop_total', '放入錢幣時', '{total}')}
                                {renderVoiceInput('shop_shortage', '金額不足', '{diff}')}
                                {renderVoiceInput('shop_over', '金額超過 (一般模式)')}
                                {renderVoiceInput('shop_change_mode_prompt', '找錢模式啟動', '{price}')}
                                {renderVoiceInput('shop_change_complete', '找錢完成', '{change}')}
                            </div>
                        </div>
                    )}

                    {activeTab === 'PRODUCTS' && (
                        <>
                            {/* Add New Product */}
                            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                                <h3 className="text-lg font-bold text-blue-800 mb-4">新增商品</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">商品名稱</label>
                                        <input 
                                            type="text" 
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            className="w-full p-2 border rounded-lg"
                                            placeholder="例如：鉛筆"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">價格</label>
                                        <input 
                                            type="number" 
                                            value={newItemPrice}
                                            onChange={(e) => setNewItemPrice(Number(e.target.value))}
                                            className="w-full p-2 border rounded-lg"
                                            placeholder="例如：10"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">圖片</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            ref={productFileInputRef}
                                            onChange={handleProductFileChange}
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                        />
                                        {newItemImage && (
                                            <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border">
                                                <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={handleAddProduct}
                                    disabled={!newItemName || !newItemPrice || !newItemImage}
                                    className={`mt-4 w-full py-3 rounded-xl font-bold text-white shadow
                                        ${(!newItemName || !newItemPrice || !newItemImage) ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600 active:scale-95 transition-all'}`}
                                >
                                    <i className="fas fa-plus mr-2"></i> 加入清單
                                </button>
                            </div>

                            {/* Product List */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">目前商品列表 ({products.length})</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {products.map(p => (
                                        <div key={p.id} className="flex items-center p-3 bg-white border rounded-lg shadow-sm">
                                            <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded mr-3 bg-gray-100" />
                                            <div className="flex-1">
                                                <div className="font-bold">{p.name}</div>
                                                <div className="text-sm text-gray-500">${p.price}</div>
                                            </div>
                                            {p.isCustom ? (
                                                <button 
                                                    onClick={() => handleDeleteProduct(p.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">預設</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'COINS' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="text-sm text-blue-800">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    您可以上傳真實的錢幣/紙鈔照片來取代預設圖片，或設定專屬的介紹語音。
                                </div>
                                <button 
                                    onClick={handleResetAllCoins}
                                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-bold whitespace-nowrap ml-2"
                                >
                                    全部還原預設
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {coins.map(coin => (
                                    <div key={coin.value} className="bg-white p-4 rounded-xl border shadow-sm flex flex-col space-y-3">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <Coin data={coin} size="md" disableAnimation />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-800">{coin.label}</h4>
                                                <p className="text-xs text-slate-500 mb-2">
                                                    {coin.customImage ? '使用自訂圖片' : '使用預設圖片'}
                                                </p>
                                                <div className="flex gap-2">
                                                    <label className="flex-1 cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-2 px-3 rounded-lg text-center transition-colors">
                                                        <span>更換圖片</span>
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*"
                                                            onChange={(e) => handleCoinFileChange(e, coin.value)}
                                                        />
                                                    </label>
                                                    {(coin.customImage || coin.customIntro) && (
                                                        <button 
                                                            onClick={() => handleResetCoin(coin.value)}
                                                            className="px-3 py-2 bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg"
                                                            title="還原此項目預設"
                                                        >
                                                            <i className="fas fa-undo"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t mt-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">個別語音介紹 (認識錢幣模式)</label>
                                            <div className="flex gap-2">
                                                <textarea 
                                                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder={`預設: 這是${coin.label}... (留空則使用預設樣板)`}
                                                    rows={2}
                                                    value={coin.customIntro || ''}
                                                    onChange={(e) => handleCoinIntroChange(e.target.value, coin.value)}
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const text = coin.customIntro || appSettings.voice.learn_intro.replace('{label}', coin.label).replace('{color}', coin.colorDescription);
                                                        speak(text);
                                                    }}
                                                    className="px-3 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg"
                                                    title="試聽"
                                                >
                                                    <i className="fas fa-volume-up"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
