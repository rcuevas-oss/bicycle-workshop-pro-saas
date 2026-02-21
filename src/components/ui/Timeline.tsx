import React from 'react';
import { CheckCircle, AlertCircle, PlayCircle, Radio } from 'lucide-react';

export interface TimelineItem {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'start';
}

interface TimelineProps {
    items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
    const getConfig = (type: TimelineItem['type']) => {
        switch (type) {
            case 'success': return { icon: <CheckCircle size={14} />, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
            case 'warning': return { icon: <AlertCircle size={14} />, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
            case 'start': return { icon: <PlayCircle size={14} />, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' };
            default: return { icon: <Radio size={14} />, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100' };
        }
    };

    return (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
            {items.map((item) => {
                const config = getConfig(item.type);
                return (
                    <div key={item.id} className="relative flex items-start gap-6 group">
                        {/* Dot */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border bg-white shadow-sm z-10 shrink-0 ${config.border} ${config.color}`}>
                            {config.icon}
                        </div>
                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className="font-bold text-slate-900 text-sm leading-tight">{item.title}</div>
                                <time className="font-medium text-[10px] text-slate-400 uppercase tracking-tighter whitespace-nowrap">{item.time}</time>
                            </div>
                            <div className="text-xs text-slate-500 font-medium leading-relaxed">{item.description}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
