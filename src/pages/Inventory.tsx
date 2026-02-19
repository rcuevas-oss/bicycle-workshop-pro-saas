import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import {
    Package, Search, Plus, AlertTriangle,
    TrendingUp, Settings, AlertOctagon,
    Pencil, Trash2
} from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { ProductModal } from '../components/inventory/ProductModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import type { InventarioItem } from '../types/database';

export const Inventory: React.FC = () => {
    const { products, loading, error, deleteProduct, refresh } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');


    // CRUD State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<InventarioItem | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<InventarioItem | null>(null);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const lowStockCount = products.filter(p => p.stock_actual <= p.stock_minimo).length;
    const totalValue = products.reduce((acc, p) => acc + (p.costo * p.stock_actual), 0);

    const handleCreate = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const handleEdit = (product: InventarioItem) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleDelete = (product: InventarioItem) => {
        setDeletingProduct(product);
    };

    const confirmDelete = async () => {
        if (deletingProduct) {
            const result = await deleteProduct(deletingProduct.id);
            if (!result.success) {
                alert(result.error);
            }
            setDeletingProduct(null);
            refresh();
        }
    };

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertOctagon size={48} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Error al cargar inventario</h2>
                <p className="text-slate-500 mb-4">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header & Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pañol de Insumos</h1>
                    <p className="text-slate-500 font-medium">Gestión de costos internos y stock de taller</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleCreate}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={18} /> Nuevo Producto
                    </button>
                </div>
            </div>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                initialData={editingProduct}
            />

            <ConfirmationModal
                isOpen={!!deletingProduct}
                onClose={() => setDeletingProduct(null)}
                onConfirm={confirmDelete}
                title="¿Eliminar Producto?"
                message={`¿Estás seguro de que deseas eliminar "${deletingProduct?.nombre}"? Esta acción no se puede deshacer si el producto ya ha sido utilizado.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDangerous={true}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-blue-50 opacity-50 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Package size={20} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Items</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">{products.length}</h3>
                        <p className="text-sm font-bold text-slate-400">Productos registrados</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 ${lowStockCount > 0 ? 'bg-amber-50' : 'bg-emerald-50'} opacity-50 rounded-full blur-3xl group-hover:scale-150 transition-transform`}></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-xl ${lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {lowStockCount > 0 ? <AlertTriangle size={20} /> : <TrendingUp size={20} />}
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Alertas Stock</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">{lowStockCount}</h3>
                        <p className="text-sm font-bold text-slate-400">Items bajo mínimo</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-slate-100 opacity-50 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                                <Settings size={20} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Valorización</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">${totalValue.toLocaleString('es-CL')}</h3>
                        <p className="text-sm font-bold text-slate-400">Costo total inventario</p>
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <Card className="border-0 shadow-xl shadow-slate-200/50">
                <div className="mb-6">
                    <Input
                        placeholder="Buscar por nombre o SKU..."
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto -mx-6">
                    <div className="inline-block min-w-full align-middle px-6">
                        <table className="min-w-full table-fixed divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">SKU</th>
                                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                                    <th className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Stock</th>
                                    <th className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Valor Ref. (APU)</th>
                                    <th className="px-4 py-4 text-right w-24">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-medium animate-pulse">
                                            Cargando inventario...
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-medium italic">
                                            No se encontraron productos.
                                        </td>
                                    </tr>
                                ) : filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 py-4 font-mono text-xs font-bold text-slate-400">{product.sku || '---'}</td>
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{product.nombre}</div>
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className={`font-black ${product.stock_actual <= product.stock_minimo ? 'text-red-600' : 'text-slate-700'}`}>
                                                        {product.stock_actual}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{product.unidad_medida === 'gramos' ? 'G' : product.unidad_medida === 'mililitros' ? 'ML' : product.unidad_medida === 'metros' ? 'M' : 'UN'}</span>
                                                    {product.stock_actual <= product.stock_minimo && (
                                                        <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium">Min: {product.stock_minimo}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="font-bold text-slate-900">${product.precio_venta.toLocaleString('es-CL')}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">/{product.unidad_medida === 'unidades' ? 'UN' : product.unidad_medida === 'gramos' ? 'G' : product.unidad_medida === 'mililitros' ? 'ML' : 'M'}</div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>
        </div>
    );
};
