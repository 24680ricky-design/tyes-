import React, { useState } from 'react';
import { CoinType, AppSettings } from '../types';
import Coin from '../components/Coin';
import { speak } from '../utils/tts';

interface LearnProps {
    onBack: () => void;
    coins: CoinType[];
    appSettings: AppSettings;
}

const Learn: React.FC<LearnProps> = ({ onBack, coins, appSettings }) => {
    // State to track which coins are revealed (by value)
    // Default: Show all (as per typical initial state, or hidden if preferred. Let's default to revealed but allow hiding)
    // Re-reading user request: "Must have hide function".
    const [revealedCoins, setRevealedCoins] = useState<number[]>(coins.map(c => c.value));
    
    const showAll = () => {
        setRevealedCoins(coins.map(c => c.value));
        speak("全部打開");
    };

    const hideAll = () => {
        setRevealedCoins([]);
        speak("全部蓋起來");
    };

    const handleCoinReveal = (coin: CoinType) => {
        setRevealedCoins(prev => [...prev, coin.value]);
        
        // Speak intro
        let text = appSettings.voice.learn_intro;
        text = text.replace('{label}', coin.label).replace('{color}', coin.colorDescription);
        speak(text);
    };

    const handleCoinHide = (e: React.MouseEvent, coinValue: number) => {
        e.stopPropagation(); // Prevent triggering the card click
        setRevealedCoins(prev => prev.filter(v => v !== coinValue));
    };

    const handlePlaySound = (e: React.MouseEvent, coin: CoinType) => {
        e.stopPropagation();
        let text = appSettings.voice.learn_intro;
        text = text.replace('{label}', coin.label).replace('{color}', coin.colorDescription);
        speak(text);
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="bg-orange-500 p-4 text-white flex items-center shadow-lg sticky top-0 z-20">
                <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors mr-2">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </button>
                <h1 className="text-2xl font-bold flex-1">認識錢幣</h1>
                
                <div className="flex gap-2">
                    <button 
                        onClick={showAll}
                        className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg font-bold flex items-center transition-colors text-sm md:text-base"
                    >
                        <i className="fas fa-eye mr-2"></i>
                        全部打開
                    </button>
                    <button 
                        onClick={hideAll}
                        className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg font-bold flex items-center transition-colors text-sm md:text-base"
                    >
                        <i className="fas fa-eye-slash mr-2"></i>
                        全部蓋上
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-orange-50">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {coins.map(coin => {
                            const isRevealed = revealedCoins.includes(coin.value);
                            
                            return (
                                <div 
                                    key={coin.value}
                                    className={`
                                        relative bg-white rounded-3xl shadow-xl flex flex-col items-center justify-between
                                        transition-all duration-500 cursor-pointer overflow-hidden
                                        ${!isRevealed ? 'bg-orange-200 ring-4 ring-orange-200' : 'hover:-translate-y-1 hover:shadow-2xl'}
                                    `}
                                    style={{ minHeight: '280px' }}
                                    onClick={() => !isRevealed && handleCoinReveal(coin)}
                                >
                                    {/* Card Content (Revealed) */}
                                    <div className={`
                                        w-full h-full p-6 flex flex-col items-center justify-between transition-opacity duration-500 relative
                                        ${isRevealed ? 'opacity-100' : 'opacity-0 absolute inset-0'}
                                    `}>
                                        {/* Single Hide Button */}
                                        <button 
                                            onClick={(e) => handleCoinHide(e, coin.value)}
                                            className="absolute top-2 right-2 p-2 text-slate-300 hover:text-slate-500 transition-colors z-10"
                                            title="隱藏這個"
                                        >
                                            <i className="fas fa-eye-slash text-xl"></i>
                                        </button>

                                        <div className="flex-1 flex items-center justify-center w-full py-4" onClick={(e) => handlePlaySound(e, coin)}>
                                            <Coin 
                                                data={coin} 
                                                size="lg" 
                                                disableAnimation 
                                                className="shadow-2xl"
                                            />
                                        </div>
                                        <div className="text-center mt-4">
                                            <h3 className="text-3xl font-bold text-slate-800 mb-1">{coin.label}</h3>
                                            <p className="text-slate-500 text-sm">{coin.colorDescription}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => handlePlaySound(e, coin)}
                                            className="mt-4 w-full py-2 bg-orange-100 text-orange-600 rounded-xl font-bold hover:bg-orange-200"
                                        >
                                            <i className="fas fa-volume-up mr-2"></i> 聽聽看
                                        </button>
                                    </div>

                                    {/* Card Cover (Hidden) */}
                                    <div className={`
                                        absolute inset-0 bg-orange-300 flex flex-col items-center justify-center
                                        transition-all duration-500
                                        ${isRevealed ? 'opacity-0 pointer-events-none scale-150' : 'opacity-100'}
                                    `}>
                                        <div className="w-24 h-24 rounded-full bg-white/30 flex items-center justify-center mb-4 border-4 border-white/40">
                                            <i className="fas fa-question text-6xl text-white"></i>
                                        </div>
                                        <span className="text-white font-bold text-xl tracking-widest">點擊翻開</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Learn;