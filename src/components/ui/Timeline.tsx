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
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {items.map((item) => {
                const config = getConfig(item.type);
                return (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Dot */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border bg-white shadow-sm z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${config.border} ${config.color}`}>
                            {config.icon}
                        </div>
                        {/* Content */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:shadow-lg transition-all">
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
