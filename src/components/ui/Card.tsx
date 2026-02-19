import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
    return (
        <div className={`bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md ${className}`}>
            {(title || action) && (
                <div className="flex justify-between items-center mb-6 gap-4">
                    {title && <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>}
                    {action && <div className="shrink-0">{action}</div>}
                </div>
            )}
            <div className="relative">
                {children}
            </div>
        </div>
    );
};
