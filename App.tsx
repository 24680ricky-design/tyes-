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

    // Load data from local storage on mount
    useEffect(() => {
        // Products
        const savedProducts = localStorage.getItem('tyes_products');
        if (savedProducts) {
            setProducts(JSON.parse(savedProducts));
        } else {
            setProducts(DEFAULT_PRODUCTS);
        }

        // Coins
        const savedCoins = localStorage.getItem('tyes_coins');
        if (savedCoins) {
            setCoins(JSON.parse(savedCoins));
        } else {
            setCoins(DEFAULT_COINS);
        }

        // Settings
        const savedSettings = localStorage.getItem('tyes_settings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            // Merge with default voice settings if missing (for migration)
            if (!parsed.voice) {
                parsed.voice = DEFAULT_SETTINGS.voice;
            }
            setAppSettings(parsed);
        } else {
            setAppSettings(DEFAULT_SETTINGS);
        }
    }, []);

    // Save products when updated
    const handleUpdateProducts = (newProducts: Product[]) => {
        setProducts(newProducts);
        localStorage.setItem('tyes_products', JSON.stringify(newProducts));
    };

    // Save coins when updated
    const handleUpdateCoins = (newCoins: CoinType[]) => {
        setCoins(newCoins);
        localStorage.setItem('tyes_coins', JSON.stringify(newCoins));
    };

    // Save settings when updated
    const handleUpdateAppSettings = (newSettings: AppSettings) => {
        setAppSettings(newSettings);
        localStorage.setItem('tyes_settings', JSON.stringify(newSettings));
    };

    return (
        <div className="min-h-screen bg-blue-50 relative">
            {/* Global Settings Button (Top Right) - Only visible on Home */}
            {currentView === 'HOME' && (
                <button 
                    onClick={() => setShowSettings(true)}
                    className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur p-3 rounded-full shadow-lg text-slate-400 hover:text-blue-600 transition-colors"
                    title="教學後台管理"
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

            {currentView === 'HOME' && <Home onChangeView={setCurrentView} appSettings={appSettings} />}
            {currentView === 'LEARN' && <Learn onBack={() => setCurrentView('HOME')} coins={coins} appSettings={appSettings} />}
            {currentView === 'FIND' && <Find onBack={() => setCurrentView('HOME')} coins={coins} appSettings={appSettings} />}
            {currentView === 'SHOP' && <Shop onBack={() => setCurrentView('HOME')} products={products} coins={coins} appSettings={appSettings} />}
        </div>
    );
};

export default App;