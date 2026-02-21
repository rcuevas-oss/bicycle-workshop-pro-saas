# 🛠️ Workshop Pro SaaS - Sistema de Gestión de Taller de Bicicletas

Workshop Pro es una plataforma SaaS (Software as a Service) moderna, diseñada específicamente para optimizar la operación técnica y administrativa de talleres de bicicletas profesionales. Enfocada en la precisión mecánica y la salud financiera del taller, la plataforma integra gestión de inventario crítico (Pañol), presupuestación avanzada (APU), y control contable detallado.

## 🚀 Funcionalidades Clave (V2.0)

### 1. Gestión de Pañol y Costos de Taller
*   **Control de Insumos Críticos**: Diferenciación entre materiales de consumo interno y repuestos.
*   **Alertas de Stock**: Indicadores visuales para niveles críticos bajo el mínimo.
*   **Valorización de Inventario**: Cálculo en tiempo real del capital inmovilizado en insumos.

### 2. Flujo de Recepción y Checklist Digital
*   **Inspección Rápida y Profesional**: Evalúe hasta 7 componentes críticos de la bicicleta (Desde Transmisión hasta Electrónica) con estados visuales semaforizados (OK, Regular, Malo, N/A).
*   **Testigo Documental de Accesorios**: Deje un registro en un solo clic si el cliente dejó Luces, Bolso, Candado o Casco, evitando extravíos.
*   **Notas de Taller al Instante**: Capture observaciones puntuales directas en la comanda.
*   **Mano de Obra y Comisiones**: Gestión transparente de porcentajes de mecánica y egresos diarios para el equipo técnico.

### 3. Administración Contable y Arqueo de Caja
*   **Estado de Resultados (P&L)**: Resumen dinámico de Ingresos vs. Egresos (incluyendo comisiones de mecánicos).
*   **Filtrado Temporal**: Pestañas de acceso rápido para balances diarios, semanales, quincenales o mensuales.
*   **Arqueo de Caja**: Herramienta de conciliación física de efectivo (billetes/monedas) contra el sistema.

### 4. Flujo de Órdenes de Trabajo Inteligente
*   **Expediente por Cliente/Bicicleta**: Historial centralizado que vincula marcas, modelos y números de serie.
*   **Cálculo de Margen en Tiempo Real**: Sepa cuánto gana exactamente en cada orden considerando materiales y servicios.

## 🏗️ Arquitectura y Stack Tecnológico

La plataforma fue refactorizada para operar bajo un modelo SaaS multi-inquilino (Multi-tenant) robusto:

*   **Frontend**: React 19 + TypeScript (100% tipado estricto, 0 `any` implícitos) + Vite.
*   **Estilos**: Vanilla CSS con enfoque "Workshop Pro Theme" (Azul petróleo y verde lima).
*   **Backend & DB**: Supabase (PostgreSQL).
*   **Seguridad (RLS)**: Aislamiento total de datos a nivel de fila (*Row Level Security*) mediante `business_id` para garantizar que cada taller vea únicamente su información.
*   **Lógica de Fechas**: Manejo preciso con `date-fns`.

## 🛠️ Instalación y Configuración

### Prerrequisitos
*   Node.js (v20 o superior recomendado)
*   Cuenta de Supabase

### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone [URL-del-repo]
   cd bicycle-workshop-pro
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Cree un archivo `.env` basado en `.env.example` con sus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu-url-de-supabase
   VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
   ```

4. **Configuración de Base de Datos:**
   Ejecute los scripts de migración ubicados en `supabase/migrations/` dentro del SQL Editor de Supabase en este orden:
   1. `00_migration_v2.sql` (Esquema central)
   2. `01_migration_security.sql` (Seguridad y Perfiles)
   3. `02_create_apu_templates.sql` (Datos Semilla - *Deprecado*)
   4. `03_fix_orders_rls.sql` (Parche de seguridad)
   5. `04_add_bike_type.sql` (Actualización de tipos de bicit)
   6. `05_add_mechanic_to_order.sql` (Asignación de mecánicos)
   7. `260221164904_drop_apu_and_add_checklist.sql` (Migración V3: Eliminación industrial APU y adición del Checklist Digital JSONB)

5. **Correr en desarrollo:**
   ```bash
   npm run dev
   ```

## 🔐 Seguridad y Autenticación
La aplicación utiliza Supabase Auth. Al registrarse, el sistema crea automáticamente:
*   Un nuevo registro en la tabla `negocio`.
*   Un `perfil` de administrador vinculado a ese negocio.
*   Este `business_id` se propaga en cada registro de la base de datos para asegurar el aislamiento.

## 📄 Licencia
Este proyecto es de uso privado. Todos los derechos reservados.

---
*Desarrollado para la era moderna del ciclismo.* 🚲✨
