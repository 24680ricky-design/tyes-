import React, { useState, useEffect, useCallback } from 'react';
import { CoinType, AppSettings } from '../types';
import Coin from '../components/Coin';
import { speak } from '../utils/tts';

interface FindProps {
    onBack: () => void;
    coins: CoinType[];
    appSettings: AppSettings;
}

type Stage = 'SETUP' | 'GAME';

const Find: React.FC<FindProps> = ({ onBack, coins, appSettings }) => {
    const [stage, setStage] = useState<Stage>('SETUP');
    const [selectedValues, setSelectedValues] = useState<number[]>([]);
    
    const [targetCoin, setTargetCoin] = useState<CoinType | null>(null);
    const [scatteredCoins, setScatteredCoins] = useState<Array<CoinType & { x: number, y: number, id: number }>>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setSelectedValues(coins.map(c => c.value));
    }, [coins]);

    const toggleCoin = (value: number) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(prev => prev.filter(v => v !== value));
        } else {
            setSelectedValues(prev => [...prev, value]);
        }
    };

    const toggleAll = () => {
        if (selectedValues.length === coins.length) {
            setSelectedValues([]);
        } else {
            setSelectedValues(coins.map(c => c.value));
        }
    };

    // --- Game Logic ---
    const generateRound = useCallback(() => {
        if (selectedValues.length === 0) return;

        const selectedPool = coins.filter(c => selectedValues.includes(c.value));
        const target = selectedPool[Math.floor(Math.random() * selectedPool.length)];
        setTargetCoin(target);
        
        let distractorPool: CoinType[] = [];
        if (selectedValues.length === 1) {
             distractorPool = coins.filter(c => c.value !== target.value);
             if (distractorPool.length === 0) distractorPool = [target];
        } else {
            distractorPool = selectedPool; 
        }

        const items = [];
        const count = 10; 
        items.push({ ...target, x: 0, y: 0, id: Math.random() });

        for (let i = 1; i < count; i++) {
            const isTargetAgain = Math.random() < 0.2;
            const sourcePool = isTargetAgain ? [target] : distractorPool;
            const randomCoin = sourcePool[Math.floor(Math.random() * sourcePool.length)];
            items.push({ ...randomCoin, x: 0, y: 0, id: Math.random() });
        }

        const dispersedItems = items.map(item => ({
            ...item,
            x: Math.random() * 70 + 15, // Keep away from extreme edges
            y: Math.random() * 60 + 20, // Keep away from header
        }));

        setScatteredCoins(dispersedItems);
        setShowSuccess(false);

        setTimeout(() => {
            speak(appSettings.voice.find_prompt.replace('{label}', target.label));
        }, 500);
    }, [coins, selectedValues, appSettings]);

    const handleStartGame = () => {
        if (selectedValues.length === 0) return;
        setStage('GAME');
        // Small timeout ensures that the 'GAME' stage div has been mounted with its height before generating
        setTimeout(generateRound, 100);
    };

    const handleCoinClick = (coin: CoinType) => {
        if (!targetCoin || showSuccess) return;

        if (coin.value === targetCoin.value) {
            speak(appSettings.voice.correct);
            setShowSuccess(true);
            setTimeout(() => {
                generateRound();
            }, 2000);
        } else {
            let text = appSettings.voice.wrong_try_again;
            text = text.replace('{current}', coin.label).replace('{target}', targetCoin.label);
            speak(text);
        }
    };

    const replayQuestion = () => {
        if (targetCoin) speak(appSettings.voice.find_prompt.replace('{label}', targetCoin.label));
    };

    if (stage === 'SETUP') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-green-50 animate-fade-in overflow-y-auto">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-4xl flex flex-col my-auto">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                            <i className="fas fa-tasks mr-3 text-green-500"></i>
                            請選擇要練習的錢幣
                        </h2>
                        <button onClick={onBack} className="text-slate-400 hover:text-slate-600">
                            <i className="fas fa-times text-2xl"></i>
                        </button>
                    </div>

                    <div className="p-2">
                        <div className="flex justify-end mb-4">
                            <button onClick={toggleAll} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold">
                                {selectedValues.length === coins.length ? '取消全選' : '全選'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {coins.map(coin => {
                                const isSelected = selectedValues.includes(coin.value);
                                return (
                                    <button
                                        key={coin.value}
                                        onClick={() => toggleCoin(coin.value)}
                                        className={`relative p-4 rounded-xl border-4 transition-all duration-200 flex flex-col items-center ${isSelected ? 'border-green-500 bg-green-50 scale-105 shadow-md' : 'border-slate-100 bg-white opacity-60'}`}
                                    >
                                        <div className="pointer-events-none mb-2">
                                            <Coin data={coin} size="md" disableAnimation />
                                        </div>
                                        <span className={`font-bold ${isSelected ? 'text-green-700' : 'text-slate-400'}`}>
                                            {coin.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-6 mt-4 border-t flex gap-4">
                        <button onClick={onBack} className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-xl">
                            返回
                        </button>
                        <button 
                            onClick={handleStartGame}
                            disabled={selectedValues.length === 0}
                            className={`flex-[2] py-4 rounded-xl font-bold text-xl shadow-lg ${selectedValues.length === 0 ? 'bg-slate-300 text-slate-500' : 'bg-green-500 text-white btn-press'}`}
                        >
                            開始找找看 <i className="fas fa-play ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-green-50 overflow-hidden relative">
             <div className="bg-green-500 p-4 text-white flex items-center shadow-lg z-20 shrink-0">
                <button onClick={() => setStage('SETUP')} className="px-4 py-2 hover:bg-white/20 rounded-lg font-bold">
                    <i className="fas fa-arrow-left mr-2"></i> 設定
                </button>
                <h1 className="text-2xl font-bold ml-4 flex-1 text-center">找找看</h1>
                <button onClick={replayQuestion} className="bg-white/20 px-4 py-2 rounded-lg font-bold whitespace-nowrap">
                    <i className="fas fa-redo mr-2"></i> 再聽一次
                </button>
            </div>

            <div className="flex-1 relative w-full overflow-hidden">
                <div className="absolute top-4 left-0 right-0 text-center z-10 pointer-events-none">
                    <div className="inline-block bg-white/90 backdrop-blur px-8 py-3 rounded-full shadow-lg border-2 border-green-200">
                        <span className="text-xl md:text-2xl text-green-800 font-bold">請找出：</span>
                        <span className="text-2xl md:text-3xl text-green-600 font-bold ml-2">{targetCoin?.label}</span>
                    </div>
                </div>

                {scatteredCoins.map((coin) => (
                    <div
                        key={coin.id}
                        className="absolute transition-all duration-500"
                        style={{
                            left: `${coin.x}%`,
                            top: `${coin.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <Coin 
                            data={coin} 
                            onClick={() => handleCoinClick(coin)} 
                            size="lg"
                            className="shadow-xl hover:scale-110 active:scale-95"
                        />
                    </div>
                ))}

                {showSuccess && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-green-500/20 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center transform scale-110">
                            <i className="fas fa-check-circle text-9xl text-green-500 mb-4 animate-bounce"></i>
                            <h2 className="text-5xl font-bold text-slate-800">答對了！</h2>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Find;