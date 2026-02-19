import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
    return (
        <div className="flex flex-col gap-2 mb-3">
            {label && (
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full 
                        ${icon ? 'pl-10' : 'px-3'} 
                        pr-3 py-2 
                        border rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] 
                        transition-shadow 
                        ${className}
                    `}
                    style={{
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
                        backgroundColor: 'var(--color-bg-card)',
                        color: 'var(--color-text-main)'
                    }}
                    {...props}
                />
            </div>
            {error && <span className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</span>}
        </div>
    );
};
