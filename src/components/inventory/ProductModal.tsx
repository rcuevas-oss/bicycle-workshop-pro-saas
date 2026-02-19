import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, BarChart3, Save, Loader2, Calculator } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { TipoProducto, InventarioItem } from '../../types/database';
import { useInventory } from '../../hooks/useInventory';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: InventarioItem | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, initialData }) => {
    const { perfil } = useAuth();
    const { createProduct, updateProduct, refresh } = useInventory();
    const [loading, setLoading] = useState(false);

    const [nombre, setNombre] = useState('');
    const [sku, setSku] = useState('');
    const [tipo, setTipo] = useState<TipoProducto>('insumo');
    const [costo, setCosto] = useState('');
    const [precioVenta, setPrecioVenta] = useState('');
    const [stockActual, setStockActual] = useState('');
    const [stockMinimo, setStockMinimo] = useState('');
    const [unidadMedida, setUnidadMedida] = useState('unidades');

    // UI Helper states for "Calculator"
    const [showCalculator, setShowCalculator] = useState(false);
    const [calcCostoTotal, setCalcCostoTotal] = useState('');
    const [calcCantidad, setCalcCantidad] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setNombre(initialData.nombre);
                setSku(initialData.sku || '');
                setTipo(initialData.tipo);
                setCosto(initialData.costo.toString());
                setPrecioVenta(initialData.precio_venta.toString());
                setStockActual(initialData.stock_actual.toString());
                setStockMinimo(initialData.stock_minimo.toString());
                setUnidadMedida(initialData.unidad_medida || 'unidades');
            } else {
                setNombre('');
                setSku('');
                setTipo('insumo');
                setCosto('');
                setPrecioVenta('');
                setStockActual('');
                setStockMinimo('');
                setUnidadMedida('unidades');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const applyCalculation = () => {
        const total = parseFloat(calcCostoTotal);
        const qty = parseFloat(calcCantidad);
        if (total && qty) {
            const unitPrice = total / qty;
            setPrecioVenta(unitPrice.toFixed(2));
            setCosto(total.toString());
            setShowCalculator(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const businessId = perfil?.negocio_id;
            if (!businessId) {
                throw new Error('No se encontró información del negocio.');
            }

            let result;

            const productData = {
                nombre,
                sku: sku || undefined,
                tipo,
                costo: Number(costo) || 0,
                precio_venta: Number(precioVenta) || 0,
                stock_actual: Number(stockActual) || 0,
                stock_minimo: Number(stockMinimo) || 0,
                unidad_medida: unidadMedida
            };

            if (initialData) {
                // Update
                result = await updateProduct(initialData.id, productData);
            } else {
                // Create
                result = await createProduct({
                    ...productData,
                    business_id: businessId
                });
            }

            if (!result.success) throw new Error(result.error);

            refresh();
            onClose();
        } catch (error: any) {
            console.error('Error saving product:', error);
            alert('Error al guardar producto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Package className="text-blue-600" size={24} />
                        {initialData ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Nombre del Producto <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                placeholder="Ej: Cámara 29 Valvula Presta"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Unidad de Medida</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 appearance-none"
                                value={unidadMedida}
                                onChange={e => setUnidadMedida(e.target.value)}
                            >
                                <option value="unidades">Unidades (UN)</option>
                                <option value="gramos">Gramos (g)</option>
                                <option value="mililitros">Mililitros (ml)</option>
                                <option value="metros">Metros (m)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">SKU / Código</label>
                            <div className="relative">
                                <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium text-slate-900"
                                    placeholder="CAM-29-PV"
                                    value={sku}
                                    onChange={e => setSku(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {!showCalculator ? (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Costo Adquisición ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                                        placeholder="0"
                                        value={costo}
                                        onChange={e => setCosto(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Valor {unidadMedida === 'unidades' ? 'Unitario' : 'por ' + unidadMedida.slice(0, -1)} (APU)</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCalculator(true)}
                                        className="text-[10px] font-black text-blue-600 uppercase hover:underline"
                                    >
                                        Calcular
                                    </button>
                                </div>
                                <div className="relative">
                                    <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        className="w-full pl-12 pr-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900 placeholder:text-emerald-300"
                                        placeholder="0"
                                        value={precioVenta}
                                        onChange={e => setPrecioVenta(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-600 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="text-white font-black text-xs uppercase tracking-widest">Asistente de Costos ({unidadMedida})</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    placeholder="Costo Total ($)"
                                    className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:bg-white focus:text-blue-900 transition-all font-bold"
                                    value={calcCostoTotal}
                                    onChange={e => setCalcCostoTotal(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder={`Cant. en ${unidadMedida}`}
                                    className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:bg-white focus:text-blue-900 transition-all font-bold"
                                    value={calcCantidad}
                                    onChange={e => setCalcCantidad(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCalculator(false)}
                                    className="flex-1 py-2 text-white/70 text-xs font-black uppercase"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={applyCalculation}
                                    className="flex-2 px-4 py-2 bg-white text-blue-600 rounded-lg text-xs font-black uppercase shadow-xl"
                                >
                                    Calcular y Aplicar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                        <DollarSign className="text-blue-600 mt-0.5" size={16} />
                        <p className="text-xs text-blue-800 leading-tight">
                            <strong>Nota:</strong> El Valor APU es el costo interno. Si compras 1L (1000ml) a $10.000, el Valor APU es **$10**.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Stock Actual ({unidadMedida})</label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                placeholder="0"
                                value={stockActual}
                                onChange={e => setStockActual(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Stock Mínimo</label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                                placeholder="0"
                                value={stockMinimo}
                                onChange={e => setStockMinimo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar Producto')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
