import React, { useState } from 'react';
import { X, Search, Wrench, Package, Plus, Calculator } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useServices, type ServiceWithRecipe } from '../../hooks/useServices';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../context/AuthContext';

interface AddServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    onItemAdded: () => void;
    defaultMechanicId?: string;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({ isOpen, onClose, orderId, onItemAdded, defaultMechanicId }) => {
    const { perfil } = useAuth();
    const { services } = useServices();
    const { products } = useInventory(); // To get product details (prices, names) for the recipe
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedService, setSelectedService] = useState<ServiceWithRecipe | null>(null);
    const [adding, setAdding] = useState(false);

    if (!isOpen) return null;

    const filteredServices = services.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddService = async () => {
        if (!selectedService) return;
        setAdding(true);

        try {
            const businessId = perfil?.negocio_id;
            if (!businessId) throw new Error("No se encontró ID de negocio.");

            const itemsToInsert = [];

            // 1. Add Service Item (Labor)
            itemsToInsert.push({
                business_id: businessId,
                orden_id: orderId,
                tipo_item: 'servicio',
                servicio_catalogo_id: selectedService.id,
                descripcion: selectedService.nombre,
                cantidad: 1,
                precio_unitario: selectedService.precio_base,
                total_linea: selectedService.precio_base,
                comision_monto: selectedService.precio_base * (selectedService.comision_porcentaje || 0),
                mecanico_id: defaultMechanicId // Assign default mechanic
            });

            // 2. Add Recipe Items (Products)
            if (selectedService.receta && selectedService.receta.length > 0) {
                selectedService.receta.forEach(recipeItem => {
                    const productDetails = products.find(p => p.id === recipeItem.producto_id);
                    if (productDetails) {
                        const cant = recipeItem.cantidad_sugerida;
                        itemsToInsert.push({
                            business_id: businessId,
                            orden_id: orderId,
                            tipo_item: 'producto',
                            producto_inventario_id: productDetails.id,
                            descripcion: productDetails.nombre, // Snapshot name
                            cantidad: cant,
                            precio_unitario: productDetails.precio_venta,
                            total_linea: productDetails.precio_venta * cant,
                            comision_monto: 0, // Products usually don't give commission to mechanic, or distinct rule
                            mecanico_id: defaultMechanicId // Assign default mechanic for products too? Maybe yes for tracking.
                        });
                    }
                });
            }

            const { error: insertError } = await supabase
                .from('ot_detalles')
                .insert(itemsToInsert);

            if (insertError) throw insertError;

            // 3. Update Order Total
            const newItemsTotal = itemsToInsert.reduce((acc, item) => acc + item.total_linea, 0);
            const currentTotal = (await supabase
                .from('ordenes_trabajo')
                .select('total')
                .eq('id', orderId)
                .single()
            ).data?.total || 0;

            const { error: updateError } = await supabase
                .from('ordenes_trabajo')
                .update({ total: currentTotal + newItemsTotal })
                .eq('id', orderId);

            if (updateError) throw updateError;

            onItemAdded();
            onClose();
            setSelectedService(null);
            setSearchTerm('');

        } catch (err) {
            console.error("Error adding service:", err);
            alert("Error al agregar el servicio.");
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Wrench className="text-blue-600" size={24} /> Agregar Servicio
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

                    {/* List */}
                    <div className={`flex-1 overflow-y-auto p-4 border-r border-slate-100 ${selectedService ? 'hidden md:block' : ''}`}>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar servicio..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            {filteredServices.map(service => (
                                <button
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center group
                                        ${selectedService?.id === service.id
                                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                            : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'}
                                    `}
                                >
                                    <div>
                                        <div className="font-bold text-slate-900">{service.nombre}</div>
                                        <div className="text-xs text-slate-500 font-bold mt-0.5">${service.precio_base.toLocaleString('es-CL')}</div>
                                    </div>
                                    {service.receta && service.receta.length > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                            <Package size={10} /> +{service.receta.length} APU
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview / Confirm */}
                    <div className={`flex-1 p-6 bg-slate-50 flex-col overflow-y-auto ${!selectedService ? 'hidden md:flex justify-center items-center text-slate-400' : 'flex'}`}>
                        {!selectedService ? (
                            <div className="text-center">
                                <Wrench size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-medium">Selecciona un servicio para ver detalles</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="mb-6">
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{selectedService.nombre}</h3>
                                    <p className="text-slate-500 text-sm">{selectedService.descripcion || 'Sin descripción'}</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                <Wrench size={18} />
                                            </div>
                                            <span className="font-bold text-slate-700">Mano de Obra</span>
                                        </div>
                                        <span className="font-black text-slate-900">${selectedService.precio_base.toLocaleString('es-CL')}</span>
                                    </div>

                                    {selectedService.receta && selectedService.receta.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <Package size={12} /> Insumos Incluidos (APU)
                                            </h4>
                                            {selectedService.receta.map((item, idx) => {
                                                const product = products.find(p => p.id === item.producto_id);
                                                return (
                                                    <div key={idx} className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex justify-between items-center">
                                                        <div className="text-sm">
                                                            <span className="font-bold text-purple-900 block">{product?.nombre || 'Producto desconocido'}</span>
                                                            <span className="text-[10px] text-purple-600 font-bold uppercase">Cant: {item.cantidad_sugerida}</span>
                                                        </div>
                                                        <span className="font-bold text-purple-900 text-sm">
                                                            +{product ? (product.precio_venta * item.cantidad_sugerida).toLocaleString('es-CL') : '0'}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}


                                    <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg mt-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                <Calculator size={14} /> Presupuesto Estimado
                                            </span>
                                            <span className="text-2xl font-black">
                                                ${(selectedService.precio_base + (selectedService.receta?.reduce((acc, item) => {
                                                    const product = products.find(p => p.id === item.producto_id);
                                                    return acc + (product ? product.precio_venta * item.cantidad_sugerida : 0);
                                                }, 0) || 0)).toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 text-right">
                                            * Costo sugerido. Puede editarse en la orden.
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-4">
                                    <button
                                        onClick={handleAddService}
                                        disabled={adding}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {adding ? 'Agregando...' : (
                                            <>
                                                <Plus size={18} /> Agregar a la Orden
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setSelectedService(null)}
                                        className="w-full mt-2 py-2 text-slate-500 font-bold text-sm hover:text-slate-800 md:hidden"
                                    >
                                        Volver a lista
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
