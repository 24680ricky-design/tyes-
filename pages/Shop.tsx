import React, { useState, useEffect, useRef } from 'react';
import { View, CoinType, Product, AppSettings } from '../types';
import Coin from '../components/Coin';
import { speak } from '../utils/tts';

interface ShopProps {
    onBack: () => void;
    products: Product[];
    coins: CoinType[];
    appSettings: AppSettings;
}

type Stage = 'SETUP' | 'BUYING' | 'CHANGE_ACTION';

interface RangeOption {
    id: string;
    label: string;
    min: number;
    max: number;
}

// Ranges Definition
const RANGES: RangeOption[] = [
    { id: '1-10', label: '1-10元', min: 1, max: 10 },
    { id: '11-20', label: '11-20元', min: 11, max: 20 },
    { id: '21-30', label: '21-30元', min: 21, max: 30 },
    { id: '31-40', label: '31-40元', min: 31, max: 40 },
    { id: '41-50', label: '41-50元', min: 41, max: 50 },
    { id: '51-60', label: '51-60元', min: 51, max: 60 },
    { id: '61-70', label: '61-70元', min: 61, max: 70 },
    { id: '71-80', label: '71-80元', min: 71, max: 80 },
    { id: '81-90', label: '81-90元', min: 81, max: 90 },
    { id: '91-100', label: '91-100元', min: 91, max: 100 },
    { id: '100-500', label: '100-500元', min: 100, max: 500 },
    { id: '500-1000', label: '500-1000元', min: 500, max: 1000 },
    { id: 'all', label: '全部隨機', min: 0, max: 10000 },
];

interface FlyingCoinData {
    id: number;
    coin: CoinType;
    style: React.CSSProperties;
}

const Shop: React.FC<ShopProps> = ({ onBack, products, coins, appSettings }) => {
    // Game Config
    const [enableChangeMode, setEnableChangeMode] = useState(false);
    const [selectedRangeId, setSelectedRangeId] = useState<string>('all');
    const [enableVoiceFeedback, setEnableVoiceFeedback] = useState(true);

    // Game State
    const [stage, setStage] = useState<Stage>('SETUP');
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [trayCoins, setTrayCoins] = useState<CoinType[]>([]);
    const [feedbackMessage, setFeedbackMessage] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [initialPaymentTotal, setInitialPaymentTotal] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Animation State
    const [flyingCoins, setFlyingCoins] = useState<FlyingCoinData[]>([]);
    const trayRef = useRef<HTMLDivElement>(null);

    // Filter products based on range
    const getFilteredProducts = () => {
        const range = RANGES.find(r => r.id === selectedRangeId);
        if (!range) return products;
        
        return products.filter(p => p.price >= range.min && p.price <= range.max);
    };

    const startGame = () => {
        const pool = getFilteredProducts();
        if (pool.length === 0) {
            alert(`此範圍 (${selectedRangeId}) 沒有商品，請先至後台新增商品或選擇其他範圍`);
            return;
        }
        nextRound(pool);
    };

    const nextRound = (pool = getFilteredProducts()) => {
        const randomProduct = pool[Math.floor(Math.random() * pool.length)];
        setCurrentProduct(randomProduct);
        setTrayCoins([]);
        setStage('BUYING');
        setShowSuccess(false);
        setFeedbackMessage('');
        setInitialPaymentTotal(0);
        setIsAnimating(false);
        
        setTimeout(() => {
            speak(appSettings.voice.shop_welcome.replace('{name}', randomProduct.name).replace('{price}', randomProduct.price.toString()));
        }, 500);
    };

    const trayTotal = trayCoins.reduce((sum, c) => sum + c.value, 0);

    // --- Animation Helpers ---
    
    // Animate a single coin flying from wallet to tray
    const triggerCoinFly = (coin: CoinType, startRect?: DOMRect) => {
        return new Promise<void>((resolve) => {
            const trayRect = trayRef.current?.getBoundingClientRect();
            
            const isBill = coin.type === 'bill';
            const coinWidth = isBill ? 128 : 64;
            const coinHeight = 64;

            if (!startRect) {
                const el = document.getElementById(`wallet-coin-${coin.value}`);
                startRect = el?.getBoundingClientRect();
            }

            if (!startRect || startRect.width === 0) {
                startRect = { 
                    left: window.innerWidth - 80, 
                    top: window.innerHeight - 80, 
                    width: coinWidth, 
                    height: coinHeight 
                } as DOMRect;
            }

            if (!trayRect) {
                addToTrayLogic(coin);
                resolve();
                return;
            }

            const padding = 20;
            const maxLeft = trayRect.width - coinWidth - padding;
            const maxTop = trayRect.height - coinHeight - padding;
            const safeMaxLeft = Math.max(padding, maxLeft);
            const safeMaxTop = Math.max(padding, maxTop);

            const targetX = trayRect.left + padding + Math.random() * (safeMaxLeft - padding);
            const targetY = trayRect.top + padding + Math.random() * (safeMaxTop - padding);
            
            const flyId = Date.now() + Math.random();

            const flyingCoin: FlyingCoinData = {
                id: flyId,
                coin: coin,
                style: {
                    position: 'fixed',
                    left: startRect.left,
                    top: startRect.top,
                    width: startRect.width || coinWidth,
                    height: startRect.height || coinHeight,
                    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', 
                    zIndex: 9999,
                    pointerEvents: 'none'
                }
            };

            setFlyingCoins(prev => [...prev, flyingCoin]);

            requestAnimationFrame(() => {
                setFlyingCoins(prev => prev.map(fc => 
                    fc.id === flyId ? {
                        ...fc,
                        style: {
                            ...fc.style,
                            left: targetX,
                            top: targetY,
                            width: coinWidth, 
                            height: coinHeight,
                            transform: `rotate(${Math.random() * 30 - 15}deg)`
                        }
                    } : fc
                ));
            });

            setTimeout(() => {
                setFlyingCoins(prev => prev.filter(fc => fc.id !== flyId));
                addToTrayLogic(coin);
                resolve();
            }, 600);
        });
    };

    const animateCoinSequence = async (coinsToFly: CoinType[]) => {
        setIsAnimating(true);
        setTrayCoins([]);
        for (const coin of coinsToFly) {
            await triggerCoinFly(coin);
            await new Promise(r => setTimeout(r, 200)); 
        }
        setIsAnimating(false);
    };

    const handleWalletClick = (coin: CoinType, e: React.MouseEvent) => {
        if (stage !== 'BUYING' || isAnimating) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        triggerCoinFly(coin, rect);
    };

    const addToTrayLogic = (coin: CoinType) => {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-coin-win-notification-1992.mp3'); 
        audio.volume = 0.3;
        audio.play().catch(() => {});

        setTrayCoins(prev => {
            const newTray = [...prev, coin];
            const newTotal = newTray.reduce((sum, c) => sum + c.value, 0);
            if (enableVoiceFeedback) {
                 speak(appSettings.voice.shop_total.replace('{total}', newTotal.toString()));
            }
            return newTray;
        });
    };

    const handleTrayClick = (index: number) => {
        if (isAnimating) return;
        
        if (stage === 'BUYING') {
            setTrayCoins(prev => prev.filter((_, i) => i !== index));
        } else if (stage === 'CHANGE_ACTION') {
            const newTray = trayCoins.filter((_, i) => i !== index);
            setTrayCoins(newTray);
            
            const currentTrayTotal = newTray.reduce((sum, c) => sum + c.value, 0);
            const paidAmount = initialPaymentTotal - currentTrayTotal; 
            
            if (currentProduct) {
                if (paidAmount === currentProduct.price) {
                     speak(appSettings.voice.shop_change_complete.replace('{change}', currentTrayTotal.toString()));
                     setShowSuccess(true);
                     setTimeout(() => nextRound(), 3000);
                } else if (paidAmount > currentProduct.price) {
                    speak(appSettings.voice.shop_change_mode_prompt.replace('{price}', currentProduct.price.toString()));
                } else {
                     speak(`目前拿了${paidAmount}元，還要再拿。`); // Minor hardcoded logic for mid-step guidance
                }
            }
        }
    };

    const checkPayment = () => {
        if (!currentProduct || isAnimating) return;

        if (trayTotal === currentProduct.price) {
            speak(appSettings.voice.correct);
            setShowSuccess(true);
            setTimeout(() => nextRound(), 3000);
        } else if (trayTotal < currentProduct.price) {
            const diff = currentProduct.price - trayTotal;
            setFeedbackMessage(`還差 ${diff} 元`);
            speak(appSettings.voice.shop_shortage.replace('{diff}', diff.toString()));
        } else {
            if (enableChangeMode) {
                setInitialPaymentTotal(trayTotal);
                const breakdown = breakDownValue(trayTotal, currentProduct.price);
                
                setFeedbackMessage(`請點選錢幣，拿走 ${currentProduct.price} 元付給老闆`);
                speak(appSettings.voice.shop_change_mode_prompt.replace('{price}', currentProduct.price.toString()));
                
                animateCoinSequence(breakdown).then(() => {
                    setStage('CHANGE_ACTION');
                });
                
            } else {
                speak(appSettings.voice.shop_over);
            }
        }
    };

    const breakDownValue = (total: number, target: number): CoinType[] => {
        const result: CoinType[] = [];
        let remainingTarget = target;
        [50, 10, 5, 1].forEach(val => {
            while (remainingTarget >= val) {
                const coinDef = coins.find(c => c.value === val);
                if (coinDef) result.push(coinDef);
                remainingTarget -= val;
            }
        });
        let remainingChange = total - target;
        const sortedCoins = [...coins].sort((a,b) => b.value - a.value);
        sortedCoins.forEach(coinDef => {
             while (remainingChange >= coinDef.value) {
                result.push(coinDef);
                remainingChange -= coinDef.value;
            }
        });
        return result.sort((a,b) => b.value - a.value);
    };
    
    const magicSolve = () => {
        if (!currentProduct || isAnimating) return;
        const solution: CoinType[] = [];
        let remaining = currentProduct.price;
        const sortedCoins = [...coins].sort((a,b) => b.value - a.value);
        sortedCoins.forEach(c => {
            while(remaining >= c.value) {
                solution.push(c);
                remaining -= c.value;
            }
        });
        
        speak("像這樣付就對了");
        animateCoinSequence(solution);
    };

    const resetTray = () => {
        if (stage === 'BUYING' && !isAnimating) setTrayCoins([]);
    };

    if (stage === 'SETUP') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-2xl border-t-8 border-blue-500 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-slate-800">遊戲設定</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-lg font-bold text-slate-700 mb-3">請選擇價格範圍</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {RANGES.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSelectedRangeId(opt.id)}
                                        className={`
                                            p-3 rounded-xl font-bold border-2 text-sm md:text-base transition-all
                                            ${selectedRangeId === opt.id 
                                                ? 'bg-blue-500 text-white border-blue-500 scale-105 shadow-md' 
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                                            }
                                        `}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={enableChangeMode}
                                onChange={e => setEnableChangeMode(e.target.checked)}
                                className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="ml-3 text-lg font-bold text-slate-700">開啟「找錢練習」模式</span>
                        </label>

                        <div className="flex gap-4 pt-4">
                            <button onClick={onBack} className="flex-1 py-4 rounded-xl bg-gray-200 text-gray-700 font-bold text-xl hover:bg-gray-300 transition-colors">
                                返回
                            </button>
                            <button onClick={startGame} className="flex-1 py-4 rounded-xl bg-blue-500 text-white font-bold text-xl shadow-lg btn-press hover:bg-blue-600 transition-colors">
                                開始購物
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-slate-100 relative">
             {/* Flying Coins Container */}
             {flyingCoins.map(fc => (
                 <div key={fc.id} style={fc.style}>
                     <Coin data={fc.coin} size="md" disableAnimation />
                 </div>
             ))}

             {/* Header */}
             <div className="bg-blue-600 p-2 md:p-4 text-white flex items-center shadow z-20">
                <button onClick={() => setStage('SETUP')} disabled={isAnimating} className="px-4 py-2 hover:bg-white/20 rounded-lg font-bold text-sm md:text-base transition-colors disabled:opacity-50">
                    <i className="fas fa-arrow-left mr-2"></i>設定
                </button>
                <div className="flex-1 text-center font-bold text-lg md:text-2xl">
                    {stage === 'CHANGE_ACTION' ? '請拿走要付的錢' : '購物結帳'}
                </div>
                <button 
                    onClick={() => setEnableVoiceFeedback(!enableVoiceFeedback)}
                    className={`p-2 rounded-full transition-colors ${enableVoiceFeedback ? 'bg-yellow-400 text-blue-900' : 'bg-blue-800 text-gray-400'}`}
                >
                    <i className={`fas ${enableVoiceFeedback ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
                </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Panel: Product & Tray */}
                <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                    {/* Product Card */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center relative overflow-hidden shrink-0">
                        <img 
                            src={currentProduct?.image} 
                            alt={currentProduct?.name} 
                            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl border-2 border-slate-100"
                        />
                        <div className="ml-6 flex-1">
                            <div className="text-slate-500 text-sm md:text-base">我要買...</div>
                            <div className="text-2xl md:text-4xl font-bold text-slate-800">{currentProduct?.name}</div>
                            <div className="text-3xl md:text-5xl font-bold text-red-500 mt-2">${currentProduct?.price}</div>
                        </div>
                        {stage === 'BUYING' && !isAnimating && (
                             <button onClick={magicSolve} className="absolute top-2 right-2 p-2 text-yellow-400 hover:text-yellow-500 transition-colors" title="看答案">
                                <i className="fas fa-magic text-2xl"></i>
                             </button>
                        )}
                    </div>

                    {/* Feedback Message */}
                    {feedbackMessage && (
                        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg text-center font-bold animate-pulse">
                            {feedbackMessage}
                        </div>
                    )}

                    {/* Payment Tray */}
                    <div 
                        ref={trayRef}
                        className="flex-1 bg-slate-200 rounded-3xl border-4 border-slate-300 border-dashed relative min-h-[250px] flex flex-col transition-colors hover:border-slate-400"
                    >
                        <div className="absolute top-0 left-0 bg-slate-300 px-4 py-1 rounded-br-xl text-slate-600 font-bold">
                            {stage === 'CHANGE_ACTION' ? '點擊錢幣來付錢' : '付款盤 (點擊取回)'}
                        </div>
                        <div className="absolute top-0 right-0 bg-slate-800 text-white px-4 py-2 rounded-bl-xl font-mono text-xl">
                            {stage === 'CHANGE_ACTION' 
                                ? `剩餘: ${trayCoins.reduce((s,c)=>s+c.value,0)}` 
                                : `總額: ${trayTotal}`}
                        </div>
                        
                        <div className="flex-1 p-8 flex flex-wrap content-center justify-center gap-4">
                            {trayCoins.map((coin, idx) => (
                                <Coin 
                                    key={idx} 
                                    data={coin} 
                                    onClick={() => handleTrayClick(idx)}
                                    className="animate-fade-in-up"
                                />
                            ))}
                            {trayCoins.length === 0 && stage === 'BUYING' && (
                                <div className="text-slate-400 text-center mt-10">
                                    <i className="fas fa-hand-holding-usd text-4xl mb-2"></i>
                                    <p>把錢幣放到這裡</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-4 bg-slate-300 rounded-b-2xl flex gap-4">
                            {stage === 'BUYING' ? (
                                <>
                                    <button 
                                        onClick={resetTray}
                                        disabled={isAnimating}
                                        className="flex-1 py-3 bg-white text-slate-600 rounded-xl font-bold shadow hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    >
                                        <i className="fas fa-undo mr-2"></i> 重來
                                    </button>
                                    <button 
                                        onClick={checkPayment}
                                        disabled={isAnimating}
                                        className="flex-[2] py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg text-xl hover:bg-green-600 btn-press transition-colors disabled:bg-gray-400"
                                    >
                                        付錢 <i className="fas fa-check ml-2"></i>
                                    </button>
                                </>
                            ) : (
                                <div className="w-full text-center text-blue-800 font-bold">
                                    <i className="fas fa-info-circle mr-2"></i> 請拿走要付的 ${currentProduct?.price} 元
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Wallet (Only in Buying Stage) */}
                <div className={`
                    bg-white shadow-2xl z-10 
                    md:w-80 md:border-l flex flex-col
                    ${stage !== 'BUYING' ? 'hidden md:flex md:opacity-50 md:pointer-events-none' : ''}
                `}>
                    <div className="p-4 bg-slate-800 text-white font-bold flex justify-between items-center">
                        <span><i className="fas fa-wallet mr-2"></i> 我的錢包</span>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto grid grid-cols-3 md:grid-cols-2 gap-4 content-start">
                        {coins.map(coin => (
                            <div key={coin.value} id={`wallet-coin-${coin.value}`} className="flex flex-col items-center">
                                <Coin 
                                    data={coin} 
                                    onClick={(e) => handleWalletClick(coin, e)}
                                    className={`mb-2 ${isAnimating ? 'cursor-not-allowed opacity-50' : ''}`}
                                    size="md"
                                />
                                <span className="text-xs text-slate-400">{coin.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Success Overlay */}
            {showSuccess && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center transform scale-110">
                        <i className="fas fa-star text-8xl text-yellow-400 mb-4 animate-spin-slow"></i>
                        <h2 className="text-4xl font-bold text-slate-800 mb-2">太棒了！</h2>
                        <p className="text-xl text-slate-500">準備下一題...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;