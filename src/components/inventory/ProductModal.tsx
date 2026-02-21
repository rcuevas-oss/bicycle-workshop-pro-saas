import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, BarChart3, Save, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
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
    const [costo, setCosto] = useState(''); // Costo Unitario
    const [precioVenta, setPrecioVenta] = useState('');
    const [stockActual, setStockActual] = useState('');
    const [stockMinimo, setStockMinimo] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setNombre(initialData.nombre);
                setSku(initialData.sku || '');
                setCosto(initialData.costo.toString());
                setPrecioVenta(initialData.precio_venta.toString());
                setStockActual(initialData.stock_actual.toString());
                setStockMinimo(initialData.stock_minimo.toString());
                if (initialData.costo) {
                    setCosto(initialData.costo.toString());
                }
            } else {
                setNombre('');
                setSku('');
                setCosto('');
                setPrecioVenta('');
                setStockActual('');
                setStockMinimo('');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const businessId = perfil?.negocio_id;
            if (!businessId) {
                throw new Error('No se encontró información del negocio.');
            }

            const productData = {
                nombre,
                sku: sku || undefined,
                tipo: 'repuesto' as TipoProducto,
                costo: Number(costo) || 0,
                precio_venta: Number(precioVenta) || 0,
                stock_actual: Number(stockActual) || 0,
                stock_minimo: Number(stockMinimo) || 0,
                unidad_medida: 'uni'
            };

            const result = initialData
                ? await updateProduct(initialData.id, productData)
                : await createProduct({ ...productData, business_id: businessId });

            if (!result.success) throw new Error(result.error);

            refresh();
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            alert('Error al guardar producto: ' + errorMessage);
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

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    {/* 1. Nombre del Producto */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Producto</label>
                        <div className="relative">
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                placeholder="Ej: Aceite Mineral Shimano"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 2. SKU */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">SKU / Código</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium text-slate-900"
                            placeholder="Opcional"
                            value={sku}
                            onChange={e => setSku(e.target.value)}
                        />
                    </div>

                    {/* 3. Costos y Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Stock Inicial</label>
                            <div className="relative">
                                <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-blue-50 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-900"
                                    placeholder="Ej: 50"
                                    value={stockActual}
                                    onChange={e => setStockActual(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Costo Unitario ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-900"
                                    placeholder="Ej: 2500"
                                    value={costo}
                                    onChange={e => setCosto(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 5. Venta y Alerta */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Precio al Público ($)</label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                placeholder="Precio venta"
                                value={precioVenta}
                                onChange={e => setPrecioVenta(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Stock Mínimo</label>
                            <div className="relative">
                                <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={16} />
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                                    placeholder="Avisar con..."
                                    value={stockMinimo}
                                    onChange={e => setStockMinimo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !nombre || !stockActual}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center relative overflow-hidden h-12 disabled:opacity-50"
                        >
                            <span className={`flex items-center gap-2 transition-transform duration-300 absolute ${loading ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <Loader2 className="animate-spin" size={20} />
                            </span>
                            <span className={`flex items-center gap-2 transition-transform duration-300 ${loading ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                                <Save size={20} /> {initialData ? 'Actualizar' : 'Guardar'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
