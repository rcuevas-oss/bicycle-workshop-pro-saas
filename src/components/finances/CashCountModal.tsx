import React, { useState } from 'react';
import { X, DollarSign, Calculator, CheckCircle2 } from 'lucide-react';

interface CashCountModalProps {
    isOpen: boolean;
    onClose: () => void;
    expectedCash: number;
}

export const CashCountModal: React.FC<CashCountModalProps> = ({ isOpen, onClose, expectedCash }) => {
    const [counts, setCounts] = useState({
        b20000: 0,
        b10000: 0,
        b5000: 0,
        b2000: 0,
        b1000: 0,
        coins: 0
    });

    const totalCounted =
        (counts.b20000 * 20000) +
        (counts.b10000 * 10000) +
        (counts.b5000 * 5000) +
        (counts.b2000 * 2000) +
        (counts.b1000 * 1000) +
        counts.coins;

    if (!isOpen) return null;

    const difference = totalCounted - expectedCash;
    const isBalanced = difference === 0;

    const handleInputChange = (field: keyof typeof counts, value: string) => {
        const numValue = parseInt(value) || 0;
        setCounts(prev => ({ ...prev, [field]: numValue }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300 max-h-[90vh]">
                {/* Header */}
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <Calculator size={24} className="text-emerald-300" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Arqueo de Caja</h2>
                            <p className="text-slate-400 text-sm font-medium">Cierre del día</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Esperado</p>
                            <p className="text-lg font-black text-slate-700">${expectedCash.toLocaleString('es-CL')}</p>
                        </div>
                        <div className={`p-4 rounded-2xl border text-center ${isBalanced ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                            <p className={`text-[10px] uppercase font-black tracking-wider mb-1 ${isBalanced ? 'text-emerald-600' : 'text-blue-600'}`}>Contado</p>
                            <p className={`text-lg font-black ${isBalanced ? 'text-emerald-700' : 'text-blue-700'}`}>${totalCounted.toLocaleString('es-CL')}</p>
                        </div>
                        <div className={`p-4 rounded-2xl border text-center ${difference === 0 ? 'bg-slate-50 border-slate-100' : difference > 0 ? 'bg-emerald-100 border-emerald-200' : 'bg-red-50 border-red-100'}`}>
                            <p className={`text-[10px] uppercase font-black tracking-wider mb-1 ${difference === 0 ? 'text-slate-400' : difference > 0 ? 'text-emerald-600' : 'text-red-600'}`}>Diferencia</p>
                            <p className={`text-lg font-black ${difference === 0 ? 'text-slate-400' : difference > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                {difference > 0 ? '+' : ''}{difference.toLocaleString('es-CL')}
                            </p>
                        </div>
                    </div>

                    {/* Money Counter */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <DollarSign size={16} className="text-slate-400" /> Billetes
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[20000, 10000, 5000, 2000, 1000].map((denom) => (
                                <div key={denom} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-1">
                                    <label className="text-xs font-bold text-slate-500">${denom.toLocaleString('es-CL')}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="0"
                                        onChange={(e) => handleInputChange(`b${denom}` as keyof typeof counts, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-6">
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div> Monedas (Total)
                        </h3>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-bold text-slate-500 whitespace-nowrap">Monto Total Monedas:</label>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="0"
                                        onChange={(e) => handleInputChange('coins', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200/50 rounded-xl transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 text-sm"
                    >
                        <CheckCircle2 size={18} />
                        Cerrar Caja
                    </button>
                </div>
            </div>
        </div>
    );
};
