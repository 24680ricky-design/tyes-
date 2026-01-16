import React, { useState, useEffect } from 'react';
import { CoinType } from '../types';

interface CoinProps {
    data: CoinType;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disableAnimation?: boolean;
}

const Coin: React.FC<CoinProps> = ({ data, onClick, size = 'md', className = '', disableAnimation = false }) => {
    const [imgError, setImgError] = useState(false);
    const isBill = data.type === 'bill';

    // Priority: Custom Image -> Default Image
    const displayImage = data.customImage || data.imageUrl;

    // Reset error state when image source changes
    useEffect(() => {
        setImgError(false);
    }, [displayImage]);

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

    // Determine background: 
    // If we have a valid image showing, make background transparent to avoid color bleeding.
    // Otherwise, use the fallback metallic gradients.
    const hasValidImage = displayImage && !imgError;
    const gradientClass = `coin-${data.value}`;
    
    const backgroundClass = hasValidImage 
        ? 'bg-transparent' 
        : (isBill ? 'bg-slate-100' : gradientClass);

    // Base styles
    const baseStyle = `relative flex items-center justify-center font-bold shadow-md cursor-pointer select-none 
        ${isBill ? 'rounded-md border-2 border-slate-300' : 'rounded-full border-2 border-yellow-700/20'}
        ${!disableAnimation ? 'btn-press hover:scale-105 transition-transform' : ''}
        ${className} ${sizeClasses}
    `;

    return (
        <div 
            className={`${baseStyle} ${backgroundClass}`} 
            onClick={onClick}
            role="button"
            aria-label={data.label}
        >
            {/* Fallback Text: Only show if NO image is available */}
            {!hasValidImage && (
                <span className="absolute z-10 drop-shadow-md text-slate-800 bg-white/50 px-1 rounded pointer-events-none">
                    {data.value}
                </span>
            )}

            {/* Image Layer */}
            {hasValidImage && (
                <img 
                    src={displayImage} 
                    alt={data.label}
                    className={`absolute inset-0 w-full h-full object-cover ${isBill ? 'rounded-md' : 'rounded-full'}`}
                    onError={() => setImgError(true)}
                />
            )}
        </div>
    );
};

export default Coin;