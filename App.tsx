import React, { useState, useEffect } from 'react';
import { View, Product, CoinType, AppSettings, DEFAULT_PRODUCTS, DEFAULT_COINS, DEFAULT_SETTINGS } from './types';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Find from './pages/Find';
import Shop from './pages/Shop';
import Settings from './components/Settings';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('HOME');
    const [products, setProducts] = useState<Product[]>([]);
    const [coins, setCoins] = useState<CoinType[]>(DEFAULT_COINS);
    const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const savedProducts = localStorage.getItem('tyes_products');
        if (savedProducts) {
            try {
                setProducts(JSON.parse(savedProducts) as Product[]);
            } catch (e) {
                setProducts(DEFAULT_PRODUCTS);
            }
        } else {
            setProducts(DEFAULT_PRODUCTS);
        }

        const savedCoins = localStorage.getItem('tyes_coins');
        if (savedCoins) {
            try {
                setCoins(JSON.parse(savedCoins) as CoinType[]);
            } catch (e) {
                setCoins(DEFAULT_COINS);
            }
        } else {
            setCoins(DEFAULT_COINS);
        }

        const savedSettings = localStorage.getItem('tyes_settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings) as AppSettings;
                if (!parsed.voice) parsed.voice = DEFAULT_SETTINGS.voice;
                setAppSettings(parsed);
            } catch (e) {
                setAppSettings(DEFAULT_SETTINGS);
            }
        } else {
            setAppSettings(DEFAULT_SETTINGS);
        }
    }, []);

    const handleUpdateProducts = (newProducts: Product[]) => {
        setProducts(newProducts);
        localStorage.setItem('tyes_products', JSON.stringify(newProducts));
    };

    const handleUpdateCoins = (newCoins: CoinType[]) => {
        setCoins(newCoins);
        localStorage.setItem('tyes_coins', JSON.stringify(newCoins));
    };

    const handleUpdateAppSettings = (newSettings: AppSettings) => {
        setAppSettings(newSettings);
        localStorage.setItem('tyes_settings', JSON.stringify(newSettings));
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-blue-50 relative overflow-hidden">
            {currentView === 'HOME' && (
                <button 
                    onClick={() => setShowSettings(true)}
                    className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur p-3 rounded-full shadow-lg text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <i className="fas fa-cog text-xl"></i>
                </button>
            )}

            {showSettings && (
                <Settings 
                    onClose={() => setShowSettings(false)}
                    products={products}
                    onUpdateProducts={handleUpdateProducts}
                    coins={coins}
                    onUpdateCoins={handleUpdateCoins}
                    appSettings={appSettings}
                    onUpdateAppSettings={handleUpdateAppSettings}
                />
            )}

            <main className="flex-1 w-full h-full">
                {currentView === 'HOME' && <Home onChangeView={setCurrentView} appSettings={appSettings} />}
                {currentView === 'LEARN' && <Learn onBack={() => setCurrentView('HOME')} coins={coins} appSettings={appSettings} />}
                {currentView === 'FIND' && <Find onBack={() => setCurrentView('HOME')} coins={coins} appSettings={appSettings} />}
                {currentView === 'SHOP' && <Shop onBack={() => setCurrentView('HOME')} products={products} coins={coins} appSettings={appSettings} />}
            </main>
        </div>
    );
};

export default App;