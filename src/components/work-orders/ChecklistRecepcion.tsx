import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, FileText, Bike, Key } from 'lucide-react';

export type EstadoChecklist = 'ok' | 'regular' | 'malo' | 'na';

export interface ChecklistItemData {
    estado: EstadoChecklist;
    observacion?: string;
}

export interface ChecklistData {
    items: Record<string, ChecklistItemData>;
    observaciones_generales: string;
    accesorios_dejados: string[];
}

interface ChecklistRecepcionProps {
    value?: ChecklistData;
    onChange?: (value: ChecklistData) => void;
    readOnly?: boolean;
}

const AREAS_REVISION = [
    { id: 'cuadro', label: 'Cuadro y Horquilla', desc: 'Fisuras, abolladuras, raspones de pintura.' },
    { id: 'ruedas', label: 'Ruedas y Llantas', desc: 'Descentrado, llantazos, rayos sueltos.' },
    { id: 'transmision', label: 'Transmisión', desc: 'Desgaste de cadena, piñón, platos, dobleces.' },
    { id: 'frenos', label: 'Frenos', desc: 'Desgaste de pastillas, tacto, fugas.' },
    { id: 'suspension', label: 'Suspensión', desc: 'Rayones en barras, fugas de retenes.' },
    { id: 'neumaticos', label: 'Neumáticos', desc: 'Desgaste, cortes laterales, resecado.' },
    { id: 'electricos', label: 'Eléctricos', desc: 'Display sano, cables pelados, error (e-bike).' },
];

const ACCESORIOS_COMUNES = ['Luces (Delantera/Trasera)', 'Bolso', 'Ciclocomputador / Garmin', 'Candado / U-Lock', 'Bombín', 'Caramagiola', 'Silla de niño'];

export const ChecklistRecepcion: React.FC<ChecklistRecepcionProps> = ({ value, onChange, readOnly = false }) => {

    // Default initial state
    const data: ChecklistData = value || {
        items: {},
        observaciones_generales: '',
        accesorios_dejados: []
    };

    const handleEstadoChange = (id: string, estado: EstadoChecklist) => {
        if (readOnly || !onChange) return;
        const newItems = { ...data.items };
        if (!newItems[id]) newItems[id] = { estado: 'na', observacion: '' };
        newItems[id].estado = estado;
        onChange({ ...data, items: newItems });
    };

    const handleObservacionItemChange = (id: string, observacion: string) => {
        if (readOnly || !onChange) return;
        const newItems = { ...data.items };
        if (!newItems[id]) newItems[id] = { estado: 'na', observacion: '' };
        newItems[id].observacion = observacion;
        onChange({ ...data, items: newItems });
    };

    const handleObservacionGeneralChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (readOnly || !onChange) return;
        onChange({ ...data, observaciones_generales: e.target.value });
    };

    const toggleAccesorio = (acc: string) => {
        if (readOnly || !onChange) return;
        const accs = [...data.accesorios_dejados];
        if (accs.includes(acc)) {
            onChange({ ...data, accesorios_dejados: accs.filter(a => a !== acc) });
        } else {
            onChange({ ...data, accesorios_dejados: [...accs, acc] });
        }
    };

    const getEstadoConfig = (estado: EstadoChecklist) => {
        switch (estado) {
            case 'ok': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100', bgActive: 'bg-emerald-500 text-white shadow-emerald-200' };
            case 'regular': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100', bgActive: 'bg-amber-500 text-white shadow-amber-200' };
            case 'malo': return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-100', bgActive: 'bg-rose-500 text-white shadow-rose-200' };
            case 'na':
            default: return { icon: MinusCircle, color: 'text-slate-400', bg: 'bg-slate-100', bgActive: 'bg-slate-500 text-white shadow-slate-200' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                    <Bike size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Estado de Recepción</h3>
                    <p className="text-sm text-slate-600 mt-1">
                        Registra el estado estético y mecánico inicial de la bicicleta al entrar al taller.
                        Esto protege al taller de posibles reclamos posteriores.
                    </p>
                </div>
            </div>

            {/* Inspección por Área */}
            <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    Inspección Visual Rápida
                </h4>
                <div className="grid gap-3">
                    {AREAS_REVISION.map(area => {
                        const itemData = data.items[area.id] || { estado: 'na', observacion: '' };
                        const isExpanded = itemData.estado === 'regular' || itemData.estado === 'malo' || itemData.observacion;

                        return (
                            <div key={area.id} className={`bg-white rounded-xl border transition-colors ${itemData.estado !== 'na' ? 'border-blue-200 shadow-sm' : 'border-slate-200'}`}>
                                <div className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-800 text-sm">{area.label}</div>
                                        <div className="text-xs text-slate-500">{area.desc}</div>
                                    </div>

                                    {/* Selectors */}
                                    <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto shrink-0">
                                        {(['ok', 'regular', 'malo', 'na'] as EstadoChecklist[]).map(est => {
                                            const config = getEstadoConfig(est);
                                            const Icon = config.icon;
                                            const isActive = itemData.estado === est;
                                            return (
                                                <button
                                                    key={est}
                                                    type="button"
                                                    disabled={readOnly}
                                                    onClick={() => handleEstadoChange(area.id, est)}
                                                    className={`p-2 rounded-md transition-all flex items-center justify-center
                                                        ${isActive ? `shadow-sm ${config.bgActive}` : `text-slate-500 hover:bg-white hover:text-slate-800`}
                                                        ${readOnly && !isActive ? 'opacity-30' : ''}
                                                    `}
                                                    title={est.toUpperCase()}
                                                >
                                                    <Icon size={16} strokeWidth={isActive ? 3 : 2} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Observación de Área */}
                                {(!readOnly && isExpanded) || (readOnly && itemData.observacion) ? (
                                    <div className="px-4 pb-3 pt-1 border-t border-slate-50 mt-1">
                                        <input
                                            type="text"
                                            disabled={readOnly}
                                            placeholder="Detalle de rayones, daños u observación..."
                                            className="w-full text-sm bg-slate-50 border-none rounded-lg px-3 py-2 text-slate-700 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
                                            value={itemData.observacion || ''}
                                            onChange={(e) => handleObservacionItemChange(area.id, e.target.value)}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Accesorios Dejados */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Key size={16} className="text-slate-400" />
                    Accesorios Dejados
                </h4>
                <div className="flex flex-wrap gap-2">
                    {ACCESORIOS_COMUNES.map(acc => {
                        const isSelected = data.accesorios_dejados.includes(acc);

                        if (readOnly && !isSelected) return null; // Hide unselected if readonly

                        return (
                            <button
                                key={acc}
                                type="button"
                                disabled={readOnly}
                                onClick={() => toggleAccesorio(acc)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                                    ${isSelected
                                        ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                                    ${readOnly ? 'cursor-default' : ''}
                                `}
                            >
                                {acc}
                            </button>
                        );
                    })}
                    {readOnly && data.accesorios_dejados.length === 0 && (
                        <p className="text-sm text-slate-500 italic">No dejó accesorios adicionales.</p>
                    )}
                </div>
            </div>

            {/* Observaciones Generales */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={16} className="text-slate-400" />
                    Observaciones Generales de Recepción
                </h4>
                {readOnly ? (
                    <div className="bg-amber-50/50 p-4 rounded-xl text-slate-700 text-sm border border-amber-100/50 min-h-[60px] whitespace-pre-line">
                        {data.observaciones_generales || <span className="text-slate-400 italic">Sin observaciones extra.</span>}
                    </div>
                ) : (
                    <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24 text-slate-700"
                        placeholder="Cualquier otro detalle importante de mencionar al momento de recibir la bicicleta (Ej: Cliente menciona ruido extraño al pedalear, bicicleta viene muy sucia...)"
                        value={data.observaciones_generales}
                        onChange={handleObservacionGeneralChange}
                    />
                )}
            </div>

        </div>
    );
};
