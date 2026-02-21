export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Negocio {
    id: string;
    nombre: string;
    direccion?: string;
    telefono?: string;
    creado_en: string;
}

export interface Cliente {
    id: string;
    business_id: string;
    nombre: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    creado_en: string;
}

export type TipoBicicleta = 'Ruta' | 'MTB' | 'Urbana' | 'E-Bike' | 'Infantil' | 'Otra';

export interface Bicicleta {
    id: string;
    business_id: string;
    cliente_id: string;
    marca: string;
    modelo: string;
    tipo?: TipoBicicleta;
    color?: string;
    serial?: string;
    anio?: string;
    creado_en: string;
    // Join fields
    cliente?: Cliente;
}

export type TipoProducto = 'insumo' | 'repuesto';

export interface InventarioItem {
    id: string;
    business_id: string;
    nombre: string;
    sku?: string;
    tipo: TipoProducto;
    costo: number;
    precio_venta: number;
    stock_actual: number;
    stock_minimo: number;
    unidad_medida?: string;
    creado_en: string;
}

export interface MovimientoInventario {
    id: string;
    business_id: string;
    producto_id: string;
    tipo: 'entrada' | 'salida' | 'ajuste' | 'venta' | 'uso_taller';
    cantidad: number;
    motivo?: string;
    creado_en: string;
}

export interface ServicioCatalogo {
    id: string;
    business_id: string;
    nombre: string;
    descripcion?: string;
    precio_base: number;
    comision_porcentaje: number;
    creado_en: string;
}


export type EstadoOrden = 'Pendiente' | 'Abierta' | 'En Progreso' | 'Lista' | 'Entregada' | 'Pagada' | 'Cancelada';
export type EstadoProceso = 'abierta' | 'en_proceso' | 'lista' | 'entregada' | 'pagada' | 'cancelada';

export interface OrdenTrabajo {
    id: string;
    business_id: string;
    creado_en: string;

    // V2 Relationships
    cliente_id?: string;
    bicicleta_id?: string;

    // Legacy / Denormalized fields (optional)
    cliente_nombre?: string;
    cliente_telefono?: string;
    cliente_email?: string;
    bici_modelo?: string;

    estado: string; // Legacy
    estado_proceso: EstadoProceso; // V2 State Machine
    fecha_entrega?: string;
    pagado_en?: string;
    total: number;
    checklist_recepcion?: Json;

    // Joined Data
    bicicleta?: Bicicleta;
    cliente?: Cliente;
    detalles?: OrdenDetalle[];
    mecanico?: Mecanico; // Lead mechanic (Legacy or Main)
    mecanico_id?: string;
}

export type TipoItemOrden = 'servicio' | 'producto';

export interface OrdenDetalle {
    id: string;
    business_id: string;
    orden_id: string;
    tipo_item: TipoItemOrden;

    servicio_catalogo_id?: string;
    producto_inventario_id?: string;

    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    total_linea: number;

    mecanico_id?: string;
    comision_monto: number;

    creado_en: string;
}

export interface Comision {
    id: string;
    business_id: string;
    mecanico_id: string;
    orden_id: string;
    ot_detalle_id?: string;
    monto: number;
    fecha_calculo: string;
    estado: 'pendiente' | 'pagada';
}

// Mecanico definition (can be linked to auth.users or standalone table)
export interface Mecanico {
    id: string;
    nombre: string;
    especialidad?: string;
    foto_url?: string;
    creado_en?: string;
}
