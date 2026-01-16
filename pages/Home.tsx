import React, { useState } from 'react';
import { View, AppSettings } from '../types';
import { speak } from '../utils/tts';

interface HomeProps {
    onChangeView: (view: View) => void;
    appSettings: AppSettings;
}

const Home: React.FC<HomeProps> = ({ onChangeView, appSettings }) => {
    const [showTeacherInfo, setShowTeacherInfo] = useState(false);

    const handleNav = (view: View, label: string) => {
        speak(label);
        onChangeView(view);
    };

    return (
        /* Outer container: Handles scrolling independently */
        <div className="w-full h-full overflow-y-auto overflow-x-hidden">
            /* Inner container: Handles layout, centering, and animation */
            <div className="w-full max-w-4xl mx-auto p-6 space-y-8 animate-fade-in pb-20">
                {/* Hero Section */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-blue-500 to-teal-400">
                    <div className="absolute inset-0 bg-black/20 z-0"></div>
                    <div className="relative z-10 p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-md">
                                TYES<br/>台幣教學小學堂
                            </h1>
                            <p className="text-xl md:text-2xl opacity-90">2026 特別版</p>
                        </div>
                        <div className="w-48 h-48 md:w-64 md:h-64 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/50">
                            <i className="fas fa-shopping-basket text-8xl text-white drop-shadow-lg"></i>
                        </div>
                    </div>
                </div>

                {/* Menu Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button 
                        onClick={() => handleNav('LEARN', '進入認識錢幣')}
                        className="group bg-white p-8 rounded-3xl shadow-lg border-b-8 border-orange-400 hover:-translate-y-2 transition-all duration-300 active:border-b-0 active:translate-y-1"
                    >
                        <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <i className="fas fa-glasses text-4xl text-orange-500"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">認識錢幣</h2>
                    </button>

                    <button 
                        onClick={() => handleNav('FIND', '進入找找看遊戲')}
                        className="group bg-white p-8 rounded-3xl shadow-lg border-b-8 border-green-400 hover:-translate-y-2 transition-all duration-300 active:border-b-0 active:translate-y-1"
                    >
                        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <i className="fas fa-search-dollar text-4xl text-green-500"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">找找看</h2>
                    </button>

                    <button 
                        onClick={() => handleNav('SHOP', '進入購物遊戲')}
                        className="group bg-white p-8 rounded-3xl shadow-lg border-b-8 border-blue-400 hover:-translate-y-2 transition-all duration-300 active:border-b-0 active:translate-y-1"
                    >
                        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <i className="fas fa-store text-4xl text-blue-500"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">購物遊戲</h2>
                    </button>
                </div>

                {/* Teacher Info */}
                <div className="bg-white rounded-xl shadow p-4">
                    <button 
                        onClick={() => setShowTeacherInfo(!showTeacherInfo)}
                        className="flex items-center justify-between w-full text-slate-600 font-bold"
                    >
                        <span><i className="fas fa-chalkboard-teacher mr-2"></i> {appSettings.teacherInfoTitle}</span>
                        <i className={`fas fa-chevron-down transition-transform ${showTeacherInfo ? 'rotate-180' : ''}`}></i>
                    </button>
                    {showTeacherInfo && (
                        <div 
                            className="mt-4 text-slate-600 text-sm leading-relaxed border-t pt-4"
                            dangerouslySetInnerHTML={{ __html: appSettings.teacherInfoContent }}
                        />
                    )}
                </div>

                <footer className="text-center text-slate-400 py-4">
                    {appSettings.footerText}
                </footer>
            </div>
        </div>
    );
};

export default Home;