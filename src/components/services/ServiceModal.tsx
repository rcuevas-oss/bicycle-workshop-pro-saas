

import React, { useState, useEffect } from 'react';
import { X, Hammer, DollarSign, FileText, Save, Loader2, Percent, Package, Plus, Trash2, Wand2, ChefHat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useServices, type ServiceWithRecipe, type RecipeItem } from '../../hooks/useServices';
import { useInventory } from '../../hooks/useInventory';
import { useAPUTemplates } from '../../hooks/useAPUTemplates';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: ServiceWithRecipe | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, initialData }) => {
    const { perfil } = useAuth();
    const { createService, updateService, refresh } = useServices();
    const [loading, setLoading] = useState(false);

    const { products } = useInventory(); // To search ingredients
    const { templates, loading: loadingTemplates } = useAPUTemplates();

    const [activeTab, setActiveTab] = useState<'info' | 'apu'>('info');

    // Form State
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precioBase, setPrecioBase] = useState('');
    const [comisionPorcentaje, setComisionPorcentaje] = useState('50');

    // Receta State
    const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    // Helper to calculate total cost from APU
    const totalCostoInsumos = recipeItems.reduce((acc, item) => {
        const product = products.find(p => p.id === item.producto_id);
        return acc + (product ? product.precio_venta * item.cantidad_sugerida : 0);
    }, 0);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setNombre(initialData.nombre);
                setDescripcion(initialData.descripcion || '');
                setPrecioBase(initialData.precio_base.toString());
                setComisionPorcentaje((initialData.comision_porcentaje * 100).toString());
                setRecipeItems(initialData.receta || []);
            } else {
                setNombre('');
                setDescripcion('');
                setPrecioBase('');
                setComisionPorcentaje('50');
                setRecipeItems([]);
            }
            setActiveTab('info');
            setShowTemplateSelector(false);
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

            const comision = Number(comisionPorcentaje) / 100;
            const precio = Number(precioBase) || 0;

            let result;

            if (initialData) {
                // Update
                result = await updateService(initialData.id, {
                    nombre,
                    descripcion: descripcion || undefined,
                    precio_base: precio,
                    comision_porcentaje: comision
                }, recipeItems);
            } else {
                // Create
                result = await createService({
                    nombre,
                    descripcion: descripcion || undefined,
                    precio_base: precio,
                    comision_porcentaje: comision,
                    business_id: businessId
                }, recipeItems);
            }

            if (!result.success) throw new Error(result.error);

            refresh();
            onClose();
        } catch (error: any) {
            console.error('Error saving service:', error);
            alert('Error al guardar servicio: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (!template || !template.items) return;

        // Auto-fill basic info if empty
        if (!nombre) setNombre(template.nombre);
        if (!descripcion) setDescripcion(template.descripcion || '');
        if (!precioBase) setPrecioBase(template.precio_base_sugerido.toString());

        // Process Recipe Items
        // We try to match template items (generic names) with real inventory items (by name similarity)
        const newRecipeItems: RecipeItem[] = [];

        template.items.forEach(tItem => {
            // Fuzzy search by name (very simple includes check for now)
            // Ideally we'd have a smarter matcher or prompt user to link
            const matchedProduct = products.find(p =>
                p.nombre.toLowerCase().includes(tItem.nombre_insumo_generico.toLowerCase()) ||
                tItem.nombre_insumo_generico.toLowerCase().includes(p.nombre.toLowerCase())
            );

            if (matchedProduct) {
                newRecipeItems.push({
                    business_id: perfil?.negocio_id || '',
                    servicio_id: '', // Will be set on save
                    producto_id: matchedProduct.id,
                    cantidad_sugerida: tItem.cantidad_sugerida
                });
            } else {
                // If we can't find it, we could alert the user or add a placeholder
                // For now, let's just toast/alert
                console.warn(`No se encontró producto en inventario para: ${tItem.nombre_insumo_generico}`);
            }
        });

        if (newRecipeItems.length > 0) {
            setRecipeItems(newRecipeItems);
            alert(`Se aplicó la plantilla "${template.nombre}". Se vincularon automatícamente ${newRecipeItems.length} insumos del inventario.`);
        } else {
            alert(`Se aplicó la plantilla, pero no se encontraron productos compatibles en tu inventario para los ingredientes: ${template.items.map(i => i.nombre_insumo_generico).join(', ')}. Por favor agrégalos manualmente.`);
        }

        setShowTemplateSelector(false);
    };

    const addIngredient = () => {
        // Find first available product not already in recipe (just for UX)
        const availableProduct = products.find(p => !recipeItems.some(ri => ri.producto_id === p.id)) || products[0];

        if (!availableProduct) {
            alert("No hay productos en el inventario para agregar.");
            return;
        }

        setRecipeItems([...recipeItems, {
            business_id: perfil?.negocio_id || '',
            servicio_id: '',
            producto_id: availableProduct.id,
            cantidad_sugerida: 1
        }]);
    };

    const removeIngredient = (index: number) => {
        const newItems = [...recipeItems];
        newItems.splice(index, 1);
        setRecipeItems(newItems);
    };

    const updateIngredient = (index: number, field: keyof RecipeItem, value: any) => {
        const newItems = [...recipeItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setRecipeItems(newItems);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Hammer className="text-blue-600" size={24} />
                        {initialData ? 'Editar Servicio' : 'Nuevo Servicio'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-slate-100/50 rounded-xl mb-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab('info')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2
                                ${activeTab === 'info' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FileText size={16} /> Información Básica
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('apu')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2
                                ${activeTab === 'apu' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ChefHat size={16} /> Receta APU
                            {recipeItems.length > 0 && (
                                <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full">
                                    {recipeItems.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Tab Content: Info */}
                    <div className={activeTab === 'info' ? 'block space-y-4' : 'hidden'}>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Nombre del Servicio <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Hammer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                    placeholder="Ej: Mantención Full"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Descripción</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-3 text-slate-400" size={18} />
                                <textarea
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 resize-none h-24"
                                    placeholder="Detalles de lo que incluye..."
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Precio Cliente ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full pl-12 pr-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900"
                                        placeholder="0"
                                        value={precioBase}
                                        onChange={e => setPrecioBase(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Comisión Mecánico (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                        placeholder="50"
                                        value={comisionPorcentaje}
                                        onChange={e => setComisionPorcentaje(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Content: APU */}
                    <div className={activeTab === 'apu' ? 'block' : 'hidden'}>
                        {/* APU Wizard / Template Selector */}
                        {!showTemplateSelector ? (
                            <div className="mb-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowTemplateSelector(true)}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-600/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                >
                                    <Wand2 size={18} />
                                    <span className="font-bold text-sm">Usar Mago de Plantillas</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={addIngredient}
                                    className="flex-none p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
                                    title="Agregar ingrediente manual"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <Wand2 size={16} className="text-purple-600" /> Plantillas Disponibles
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowTemplateSelector(false)}
                                        className="text-xs text-slate-400 hover:text-slate-600"
                                    >
                                        Cancelar
                                    </button>
                                </div>

                                {loadingTemplates ? (
                                    <div className="text-center py-4 text-slate-400">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                                        Cargando plantillas...
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {templates.map(template => (
                                            <button
                                                type="button"
                                                key={template.id}
                                                onClick={() => handleApplyTemplate(template.id)}
                                                className="w-full text-left p-3 bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md rounded-lg transition-all"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{template.nombre}</div>
                                                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">{template.descripcion}</div>
                                                    </div>
                                                    <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        {template.items?.length || 0} items
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recipe List */}
                        <div className="space-y-3">
                            {recipeItems.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                                    <ChefHat className="mx-auto text-slate-300 mb-2" size={32} />
                                    <p className="text-slate-400 font-medium text-sm">Este servicio no consume insumos (Aún)</p>
                                </div>
                            ) : (
                                recipeItems.map((item, idx) => {
                                    const product = products.find(p => p.id === item.producto_id);
                                    return (
                                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                                            <div className="flex-1">
                                                <select
                                                    className="w-full text-sm font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 mb-1"
                                                    value={item.producto_id}
                                                    onChange={(e) => updateIngredient(idx, 'producto_id', e.target.value)}
                                                >
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.nombre} (${p.precio_venta}/{p.unidad_medida === 'unidades' ? 'un' : p.unidad_medida === 'gramos' ? 'g' : p.unidad_medida === 'mililitros' ? 'ml' : 'm'})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                                                        value={item.cantidad_sugerida}
                                                        onChange={(e) => updateIngredient(idx, 'cantidad_sugerida', parseFloat(e.target.value))}
                                                    />
                                                    <span className="text-xs text-slate-500">{product?.unidad_medida || 'unidades'}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-xs font-bold text-slate-900">
                                                    ${product ? (product.precio_venta * item.cantidad_sugerida).toLocaleString('es-CL') : 0}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeIngredient(idx)}
                                                    className="text-red-400 hover:text-red-600 p-1 mt-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Summary */}
                        {recipeItems.length > 0 && (
                            <div className="mt-4 p-3 bg-slate-900 text-white rounded-xl flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 font-medium">
                                    <Package size={16} /> Costo Insumos:
                                </span>
                                <span className="font-bold text-lg">
                                    ${totalCostoInsumos.toLocaleString('es-CL')}
                                </span>
                            </div>
                        )}
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
                            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar Servicio')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
