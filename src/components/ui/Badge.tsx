export interface BadgeVariantType {
    variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariantType['variant'];
    className?: string;
}

import React from 'react';

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border-amber-100',
        danger: 'bg-rose-50 text-rose-700 border-rose-100',
        info: 'bg-blue-50 text-blue-700 border-blue-100',
        default: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
