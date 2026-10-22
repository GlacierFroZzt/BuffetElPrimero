/**
 * Definiciones de tipos estrictos para el sistema Buffet El Primero.
 * Diseñado conforme a estándares de tipado estricto y modelos de dominio en español.
 */

export type EstadoMesa = 'libre' | 'ocupada' | 'por_cobrar';

export type CategoriaProducto =
  | 'buffet'
  | 'refrescos'
  | 'asador_extras'
  | 'guarniciones'
  | 'bebidas'
  | 'tacos'
  | 'extras';

export type TipoArea = 'mesa' | 'domicilio';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';

export type TemaVisual = 'oscuro' | 'claro';

export interface DesglosePagoMixto {
  readonly metodo1: MetodoPago;
  readonly monto1: number;
  readonly metodo2: MetodoPago;
  readonly monto2: number;
}

export interface DivisionCuentaInfo {
  readonly personas: number;
  readonly montoPorPersona: number;
}

export interface ModificadorOpcion {
  readonly id: string;
  readonly nombre: string;
  readonly precioExtra: number;
}

export interface Producto {
  readonly id: string;
  readonly nombre: string;
  readonly descripcion: string;
  readonly precio: number;
  readonly categoria: CategoriaProducto;
  readonly modificadoresSugeridos?: readonly string[];
  readonly imagenUrl?: string;
  readonly requierePreparacion?: boolean;
  readonly itemInventarioId?: string; // Enlace directo con el inventario
}

export interface FormularioProductoDTO {
  readonly id?: string;
  readonly nombre: string;
  readonly descripcion: string;
  readonly precio: number;
  readonly categoria: CategoriaProducto;
  readonly modificadoresSugeridos?: readonly string[];
  readonly imagenUrl?: string;
  readonly requierePreparacion?: boolean;
  readonly itemInventarioId?: string;
}

export interface ItemComanda {
  readonly id: string;
  readonly productoId: string;
  readonly nombre: string;
  readonly precioUnitario: number;
  readonly categoria?: CategoriaProducto;
  readonly requierePreparacion?: boolean;
  cantidad: number;
  cantidadEnviadaCocina?: number;
  notas: string;
  modificadoresSeleccionados: string[];
  readonly fechaAgregado: string; // ISO string
}

export interface Mesa {
  readonly id: string;
  readonly numero: number;
  nombre: string;
  readonly area: TipoArea;
  readonly capacidad: number;
  estado: EstadoMesa;
  cuentaActivaId: string | null;
  horaApertura: string | null; // ISO string
  totalParcial: number;
  meseroAsignado?: string;
  buffetsAdultos?: number;
  buffetsNinos?: number;
}

export interface Cuenta {
  readonly id: string;
  mesaId: string;
  numeroMesa: number;
  nombreMesa: string;
  readonly items: ItemComanda[];
  subtotal: number;
  descuento: number;
  propina: number;
  total: number;
  estado: 'abierta' | 'cerrada';
  horaApertura: string;
  horaCierre: string | null;
  metodoPago?: MetodoPago;
  montoRecibido?: number;
  cambioEntregado?: number;
  desgloseMixto?: DesglosePagoMixto;
  divisionCuenta?: DivisionCuentaInfo;
  mesero: string;
}

export interface CorteCaja {
  readonly id: string;
  readonly fechaApertura: string;
  fechaCierre: string | null;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  totalPropinas?: number;
  cuentasCobradasCount: number;
  ticketPromedio: number;
  estaAbierto: boolean;
  pinSeguridad: string;
  totalBuffetsAdultos?: number;
  totalBuffetsNinos?: number;
  totalRefrescosVendidos?: number;
}

export interface ResumenPropinaMesero {
  readonly mesero: string;
  readonly totalPropina: number;
  readonly cuentasCount: number;
  readonly propinaEfectivo: number;
  readonly propinaTarjeta: number;
  readonly propinaTransferencia: number;
  readonly porcentajeDelTotal: number;
}

export interface TurnoCerrado extends CorteCaja {
  readonly fechaCierre: string;
  readonly cuentasCobradas: readonly Cuenta[];
  readonly movimientosInventarioTurno?: readonly MovimientoInventario[];
  readonly pedidosCocinaArchivados?: readonly PedidoCocina[];
}

export type EstadoPedidoCocina = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado';

export interface ItemPedidoCocina {
  readonly id: string;
  readonly nombre: string;
  readonly cantidad: number;
  readonly notas: string;
  readonly modificadores: readonly string[];
  completado: boolean;
}

export interface PedidoCocina {
  readonly id: string;
  readonly comandaId: string;
  mesaId: string;
  nombreMesa: string;
  readonly mesero: string;
  readonly horaEnvio: string; // ISO string
  items: ItemPedidoCocina[];
  estado: EstadoPedidoCocina;
  numeroRonda?: number;
}

export interface FiltroCategoria {
  readonly id: CategoriaProducto | 'todos';
  readonly etiqueta: string;
}

/* ==========================================================================
   TIPOS PARA CONTROL DE INVENTARIO (REFRESCOS E INGREDIENTES)
   ========================================================================== */

export type TipoItemInventario = 'refresco' | 'ingrediente';
export type UnidadMedida = 'pza' | 'kg' | 'lt' | 'porcion' | 'caja' | 'reja';

export interface ItemInventario {
  readonly id: string;
  readonly codigo?: string;
  nombre: string;
  tipo: TipoItemInventario;
  unidad: UnidadMedida;
  stockActual: number;
  stockMinimo: number;
  costoUnitario?: number;
  productoVinculadoId?: string; // Para ligar con un producto de la carta (ej. Coca-Cola)
  ultimaActualizacion: string; // ISO string
}

export type TipoMovimientoInventario =
  | 'entrada_compra'
  | 'salida_venta'
  | 'merma'
  | 'ajuste';

export interface MovimientoInventario {
  readonly id: string;
  readonly itemInventarioId: string;
  readonly nombreItem: string;
  readonly tipoMovimiento: TipoMovimientoInventario;
  readonly cantidad: number;
  readonly stockPrevio: number;
  readonly stockPosterior: number;
  readonly motivo: string;
  readonly fecha: string; // ISO string
  readonly usuario?: string;
}

/* ==========================================================================
   TIPOS PARA SISTEMA DE AVISOS DE RESURTIDO DE BARRA A COCINA
   ========================================================================== */

export type NivelUrgenciaAviso = 'bajo' | 'medio' | 'urgente';
export type EstadoAvisoBarra = 'pendiente' | 'resurtido';

export interface AvisoBarra {
  readonly id: string;
  readonly platillo: string;
  urgencia: NivelUrgenciaAviso;
  estado: EstadoAvisoBarra;
  readonly horaCreacion: string; // ISO string
  horaResurtido?: string; // ISO string
  readonly creadoPor?: string;
  notas?: string;
}

/* ==========================================================================
   TIPOS DE NAVEGACIÓN Y VISTAS
   ========================================================================== */

export type VistaPrincipal = 'mesas' | 'barra' | 'cocina' | 'inventario' | 'avisos_barra';

export type TipoEventoSync =
  | 'SYNC_ESTADO_COMPLETO'
  | 'SOLICITAR_ESTADO_ACTUAL'
  | 'MESA_ACTUALIZADA'
  | 'MESA_ELIMINADA'
  | 'NUEVA_COMANDA_COCINA'
  | 'PEDIDO_COCINA_ACTUALIZADO'
  | 'CUENTA_COBRADA'
  | 'TURNO_REINICIADO'
  | 'ESTADO_CONEXION_ACTUALIZADO'
  | 'DISPOSITIVOS_ACTUALIZADOS'
  | 'PRESENCIA_ANUNCIO'
  | 'PRESENCIA_ACK'
  | 'CATALOGO_PRODUCTOS_ACTUALIZADO'
  | 'INVENTARIO_ACTUALIZADO'
  | 'AVISO_BARRA_ACTUALIZADO';

export interface MensajeSincronizacion {
  readonly id: string;
  readonly tipo: TipoEventoSync;
  readonly timestamp: string;
  readonly remitenteId: string;
  readonly payload: unknown;
}

export * from './facturacion';
