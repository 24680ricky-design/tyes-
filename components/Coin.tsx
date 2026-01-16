import React from 'react';
import { CoinType } from '../types';

interface CoinProps {
    data: CoinType;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disableAnimation?: boolean;
}

const Coin: React.FC<CoinProps> = ({ data, onClick, size = 'md', className = '', disableAnimation = false }) => {
    const isBill = data.type === 'bill';

    let sizeClasses = '';
    if (isBill) {
        if (size === 'sm') sizeClasses = 'w-24 h-12 text-xs';
        if (size === 'md') sizeClasses = 'w-32 h-16 text-sm';
        if (size === 'lg') sizeClasses = 'w-48 h-24 text-base';
    } else {
        if (size === 'sm') sizeClasses = 'w-12 h-12 text-xs';
        if (size === 'md') sizeClasses = 'w-16 h-16 text-sm';
        if (size === 'lg') sizeClasses = 'w-24 h-24 text-xl';
    }

    // Base styles
    const baseStyle = `relative flex items-center justify-center font-bold shadow-md cursor-pointer select-none 
        ${isBill ? 'rounded-md border-2 border-slate-300' : 'rounded-full border-2 border-yellow-700/20'}
        ${!disableAnimation ? 'btn-press hover:scale-105 transition-transform' : ''}
        ${className} ${sizeClasses}
    `;

    // Fallback gradient class based on value
    const gradientClass = `coin-${data.value}`;
    
    // Priority: Custom Image -> Default Image -> Gradient Fallback
    const displayImage = data.customImage || data.imageUrl;

    return (
        <div 
            className={`${baseStyle} ${isBill ? 'bg-slate-100' : gradientClass}`} 
            onClick={onClick}
            role="button"
            aria-label={data.label}
        >
            {/* Fallback Text if image fails or while loading */}
            <span className="absolute z-10 drop-shadow-md text-slate-800 bg-white/50 px-1 rounded">
                {data.value}
            </span>

            {/* Image Layer */}
            {displayImage && (
                <img 
                    src={displayImage} 
                    alt={data.label}
                    className={`absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-multiply ${isBill ? 'rounded-md' : 'rounded-full'}`}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            )}
        </div>
    );
};

export default Coin;