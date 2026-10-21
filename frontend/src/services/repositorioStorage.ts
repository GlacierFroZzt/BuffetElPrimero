import type {
  Mesa,
  Cuenta,
  CorteCaja,
  TurnoCerrado,
  TipoArea,
  TemaVisual,
  Producto,
  PedidoCocina,
  ItemInventario,
  MovimientoInventario,
  AvisoBarra,
} from '../types';
import { MESAS_INICIALES } from '../data/mesasIniciales';
import { PRODUCTOS_INICIALES } from '../data/menuInicial';
import { INVENTARIO_INICIAL, AVISOS_BARRA_INICIALES } from '../data/inventarioInicial';
import { deduplicarYSanearMesas } from '../utils/saneadorMesas';

const CLAVES_STORAGE = {
  MESAS: 'buffet_el_primero_mesas_v1',
  CUENTAS_ACTIVAS: 'buffet_el_primero_cuentas_activas_v1',
  CUENTAS_CERRADAS: 'buffet_el_primero_cuentas_cerradas_v1',
  CORTE_ACTUAL: 'buffet_el_primero_corte_actual_v1',
  HISTORIAL_TURNOS: 'buffet_el_primero_historial_turnos_v1',
  PIN_ADMIN: 'buffet_el_primero_pin_admin_v1',
  TEMA: 'buffet_el_primero_tema_v1',
  NOMBRE_DISPOSITIVO: 'buffet_el_primero_nombre_dispositivo_v1',
  PRODUCTOS: 'buffet_el_primero_productos_v1',
  PEDIDOS_COCINA: 'buffet_el_primero_pedidos_cocina_v1',
  INVENTARIO: 'buffet_el_primero_inventario_v1',
  MOVIMIENTOS_INVENTARIO: 'buffet_el_primero_movimientos_inv_v1',
  AVISOS_BARRA: 'buffet_el_primero_avisos_barra_v1',
} as const;

const PIN_POR_DEFECTO = '1234';

export class RepositorioStorage {
  /**
   * Obtiene la preferencia de tema visual (claro o oscuro).
   * Por defecto en Buffet El Primero es 'claro' (blanco y azul).
   */
  public static obtenerTema(): TemaVisual {
    try {
      const temaGuardado = localStorage.getItem(CLAVES_STORAGE.TEMA);
      if (temaGuardado === 'claro' || temaGuardado === 'oscuro') {
        return temaGuardado;
      }
      return 'claro';
    } catch {
      return 'claro';
    }
  }

  /**
   * Guarda la preferencia de tema visual en almacenamiento local.
   */
  public static guardarTema(tema: TemaVisual): void {
    try {
      localStorage.setItem(CLAVES_STORAGE.TEMA, tema);
    } catch (e: unknown) {
      console.error('[RepositorioStorage.guardarTema] Error al guardar tema:', e);
    }
  }

  /**
   * Obtiene la lista de mesas almacenadas o inicializa con los valores por defecto.
   */
  public static obtenerMesas(): Mesa[] {
    try {
      const serializado = localStorage.getItem(CLAVES_STORAGE.MESAS);
      if (!serializado) {
        const saneadasIniciales = deduplicarYSanearMesas([...MESAS_INICIALES]);
        this.guardarMesas(saneadasIniciales);
        return saneadasIniciales;
      }
      interface MesaPersistidaLegada extends Omit<Mesa, 'area'> {
        area?: string;
      }
      const mesas = JSON.parse(serializado) as MesaPersistidaLegada[];
      const mesasNormalizadas: Mesa[] = mesas.map((m) => {
        const areaPrevia = m.area ?? '';
        const esDomicilio =
          areaPrevia === 'domicilio' ||
          areaPrevia === 'para_llevar' ||
          m.id.startsWith('domicilio') ||
          m.id.startsWith('llevar') ||
          m.id.startsWith('dom-');

        const nuevoTipoArea: TipoArea = esDomicilio ? 'domicilio' : 'mesa';
        let nombreNormalizado = m.nombre;

        if (nuevoTipoArea === 'domicilio' && (nombreNormalizado.toLowerCase().includes('domicilio') || nombreNormalizado.toLowerCase().includes('para llevar'))) {
          nombreNormalizado = nombreNormalizado.replace(/domicilio/i, 'Para Llevar');
        }

        return {
          ...m,
          nombre: nombreNormalizado,
          area: nuevoTipoArea,
        };
      });

      const saneadas = deduplicarYSanearMesas(mesasNormalizadas);
      if (saneadas.length !== mesas.length) {
        this.guardarMesas(saneadas);
      }

      return saneadas;
    } catch (error: unknown) {
      console.error('[RepositorioStorage.obtenerMesas] Error al recuperar mesas:', error);
      const saneadas = deduplicarYSanearMesas([...MESAS_INICIALES]);
      return saneadas;
    }
  }

  /**
   * Guarda el estado actual de todas las mesas.
   */
  public static guardarMesas(mesas: Mesa[]): void {
    try {
      localStorage.setItem(CLAVES_STORAGE.MESAS, JSON.stringify(mesas));
    } catch (error: unknown) {
      console.error('[RepositorioStorage.guardarMesas] Error al guardar mesas:', error);
    }
  }

  /**
   * Obtiene las cuentas activas indexadas por id de cuenta.
   */
  public static obtenerCuentasActivas(): Record<string, Cuenta> {
    try {
      const serializado = localStorage.getItem(CLAVES_STORAGE.CUENTAS_ACTIVAS);
      if (!serializado) return {};
      return JSON.parse(serializado) as Record<string, Cuenta>;
    } catch (error: unknown) {
      console.error('[RepositorioStorage.obtenerCuentasActivas] Error al recuperar cuentas activas:', error);
      return {};
    }
  }

  /**
   * Guarda el diccionario de cuentas activas.
   */
  public static guardarCuentasActivas(cuentas: Record<string, Cuenta>): void {
    try {
      localStorage.setItem(CLAVES_STORAGE.CUENTAS_ACTIVAS, JSON.stringify(cuentas));
    } catch (error: unknown) {
      console.error('[RepositorioStorage.guardarCuentasActivas] Error al guardar cuentas activas:', error);
    }
  }

  /**
   * Obtiene el historial de cuentas cerradas durante el turno o día.
   */
  public static obtenerCuentasCerradas(): Cuenta[] {
    try {
      const serializado = localStorage.getItem(CLAVES_STORAGE.CUENTAS_CERRADAS);
      if (!serializado) return [];
      return JSON.parse(serializado) as Cuenta[];
    } catch (error: unknown) {
      console.error('[RepositorioStorage.obtenerCuentasCerradas] Error al recuperar cuentas cerradas:', error);
      return [];
    }
  }

  /**
   * Agrega una cuenta cobrada al historial de cuentas cerradas sin duplicados.
   */
  public static registrarCuentaCerrada(cuenta: Cuenta): void {
    try {
      const cerradas = this.obtenerCuentasCerradas();
      const filtradas = cerradas.filter((c) => c.id !== cuenta.id);
      filtradas.unshift(cuenta);
      localStorage.setItem(CLAVES_STORAGE.CUENTAS_CERRADAS, JSON.stringify(filtradas));
    } catch (error: unknown) {
      console.error('[RepositorioStorage.registrarCuentaCerrada] Error al registrar cuenta cerrada:', error);
    }
  }

  /**
   * Guarda de forma persistente la lista completa de cuentas cerradas en el turno.
   */
  public static guardarCuentasCerradas(cuentas: Cuenta[]): void {
    try {
      localStorage.setItem(CLAVES_STORAGE.CUENTAS_CERRADAS, JSON.stringify(cuentas));
    } catch (error: unknown) {
      console.error('[RepositorioStorage.guardarCuentasCerradas] Error al guardar cuentas cerradas:', error);
    }
  }

  /**
   * Recupera la información del corte de caja actual o genera uno nuevo si no existe.
   */
  public static obtenerCorteActual(): CorteCaja {
    try {
      const serializado = localStorage.getItem(CLAVES_STORAGE.CORTE_ACTUAL);
      if (serializado) {
        return JSON.parse(serializado) as CorteCaja;
      }

      const nuevoCorte: CorteCaja = {
        id: `corte-${Date.now()}`,
        fechaApertura: new Date().toISOString(),
        fechaCierre: null,
        totalVentas: 0,
        totalEfectivo: 0,
        totalTarjeta: 0,
        totalTransferencia: 0,
        totalPropinas: 0,
        cuentasCobradasCount: 0,
        ticketPromedio: 0,
        estaAbierto: true,
        pinSeguridad: this.obtenerPinAdmin(),
        totalBuffetsAdultos: 0,
        totalBuffetsNinos: 0,
        totalRefrescosVendidos: 0,
      };
      this.guardarCorteActual(nuevoCorte);
      return nuevoCorte;
    } catch (error: unknown) {
      console.error('[RepositorioStorage.obtenerCorteActual] Error al recuperar corte actual:', error);
      return {
        id: `corte-fallback-${Date.now()}`,
        fechaApertura: new Date().toISOString(),
        fechaCierre: null,
        totalVentas: 0,
        totalEfectivo: 0,
        totalTarjeta: 0,
        totalTransferencia: 0,
        totalPropinas: 0,
        cuentasCobradasCount: 0,
        ticketPromedio: 0,
        estaAbierto: true,
        pinSeguridad: PIN_POR_DEFECTO,
        totalBuffetsAdultos: 0,
        totalBuffetsNinos: 0,
        totalRefrescosVendidos: 0,
      };
    }
  }

  /**
   * Actualiza el corte de caja en almacenamiento.
   */
  public static guardarCorteActual(corte: CorteCaja): void {
    try {
      localStorage.setItem(CLAVES_STORAGE.CORTE_ACTUAL, JSON.stringify(corte));
    } catch (error: unknown) {
      console.error('[RepositorioStorage.guardarCorteActual] Error al guardar corte:', error);
    }
  }

  /**
   * Obtiene la lista histórica de turnos pasados cerrados.
   */
  public static obtenerHistorialTurnos(): TurnoCerrado[] {
    try {
      const serializado = localStorage.getItem(CLAVES_STORAGE.HISTORIAL_TURNOS);
      if (!serializado) return [];
      return JSON.parse(serializado) as TurnoCerrado[];
    } catch (error: unknown) {
      console.error('[RepositorioStorage.obtenerHistorialTurnos] Error al recuperar historial de turnos:', error);
      return [];
    }
  }

  /**
   * Guarda la lista histórica de turnos pasados.
   */
  public static guardarHistorialTurnos(turnos: TurnoCerrado[]): void {
    try {
      localStorage.setItem(CLAVES_STORAGE.HISTORIAL_TURNOS, JSON.stringify(turnos));
    } catch (error: unknown) {
      console.error('[RepositorioStorage.guardarHistorialTurnos] Error al guardar historial de turnos:', error);
    }
  }

  /**
   * Cierra y archiva el turno actual con sus cuentas cobradas y movimientos en el historial.
   */
  public static archivarTurnoYCerrar(
    corteActual: CorteCaja,
    cuentasCerradas: Cuenta[],
    nuevoPin?: string,
    movimientosInventario?: MovimientoInventario[]
  ): { nuevoCorte: CorteCaja; turnoCerrado: TurnoCerrado } {
    try {
      const horaCierre = new Date().toISOString();
      const turnoCerrado: TurnoCerrado = {
        ...corteActual,
        fechaCierre: horaCierre,
        estaAbierto: false,
        cuentasCobradas: [...cuentasCerradas],
        movimientosInventarioTurno: movimientosInventario ? [...movimientosInventario] : [],
      };

      const historial = this.obtenerHistorialTurnos();
      const historialSinDuplicado = historial.filter((t) => t.id !== turnoCerrado.id);
      const nuevoHistorial = [turnoCerrado, ...historialSinDuplicado];
      this.guardarHistorialTurnos(nuevoHistorial);

      const nuevoCorte: CorteCaja = {
        id: `corte-${Date.now()}`,
        fechaApertura: horaCierre,
        fechaCierre: null,
        totalVentas: 0,
        totalEfectivo: 0,
        totalTarjeta: 0,
        totalTransferencia: 0,
        totalPropinas: 0,
        cuentasCobradasCount: 0,
        ticketPromedio: 0,
        estaAbierto: true,
        pinSeguridad: nuevoPin ?? this.obtenerPinAdmin(),
        totalBuffetsAdultos: 0,
        totalBuffetsNinos: 0,
        totalRefrescosVendidos: 0,
      };

      this.guardarCorteActual(nuevoCorte);
      localStorage.removeItem(CLAVES_STORAGE.CUENTAS_CERRADAS);

      return { nuevoCorte, turnoCerrado };
    } catch (error: unknown) {
      console.error('[RepositorioStorage.archivarTurnoYCerrar] Error al archivar y cerrar turno:', error);
      throw error;
    }
  }

  public static reiniciarTurno(nuevoPin?: string): CorteCaja {
    try {
      const corteActual = this.obtenerCorteActual();
      const cuentasCerradas = this.obtenerCuentasCerradas();
      const { nuevoCorte } = this.archivarTurnoYCerrar(corteActual, cuentasCerradas, nuevoPin);
      return nuevoCorte;
    } catch (error: unknown) {
      console.error('[RepositorioStorage.reiniciarTurno] Error al reiniciar turno:', error);
      throw error;
    }
  }

  public static obtenerPinAdmin(): string {
    try {
      const pin = localStorage.getItem(CLAVES_STORAGE.PIN_ADMIN);
      return pin ?? PIN_POR_DEFECTO;
    } catch (error: unknown) {
      console.error('[RepositorioStorage.obtenerPinAdmin] Error al obtener PIN:', error);
      return PIN_POR_DEFECTO;
    }
  }

  public static guardarPinAdmin(nuevoPin: string): void {
    try {
      localStorage.setItem(CLAVES_STORAGE.PIN_ADMIN, nuevoPin);
    } catch (error: unknown) {
      console.error('[RepositorioStorage.guardarPinAdmin] Error al guardar nuevo PIN:', error);
    }
  }

  public static obtenerNombreDispositivo(): string {
    try {
      const guardado = localStorage.getItem(CLAVES_STORAGE.NOMBRE_DISPOSITIVO);
      if (guardado && guardado.trim()) {
        return guardado.trim();
      }
      return 'Terminal Buffet';
    } catch {
      return 'Terminal Buffet';
    }
  }

  public static guardarNombreDispositivo(nombre: string): void {
    try {
      const limpio = nombre.trim();
      if (limpio) {
        localStorage.setItem(CLAVES_STORAGE.NOMBRE_DISPOSITIVO, limpio);
      }
    } catch (error: unknown) {
      console.error('[RepositorioStorage.guardarNombreDispositivo] Error al guardar nombre:', error);
    }
  }

  public static obtenerProductos(): Producto[] {
    try {
      const serializado = localStorage.getItem(CLAVES_STORAGE.PRODUCTOS);
      if (serializado) {
        const datos = JSON.parse(serializado) as unknown;
        if (Array.isArray(datos) && datos.length > 0) {
          return datos as Producto[];
        }
      }

      const iniciales = [...PRODUCTOS_INICIALES];
      RepositorioStorage.guardarProductos(iniciales);
      return iniciales;
    } catch (error: unknown) {
      console.error('[RepositorioStorage.obtenerProductos] Error al cargar productos:', error);
      return [...PRODUCTOS_INICIALES];
    }
  }

  public static guardarProductos(productos: Producto[]): void {
    try {
      localStorage.setItem(CLAVES_STORAGE.PRODUCTOS, JSON.stringify(productos));
    } catch (error: unknown) {
      console.error('[RepositorioStorage.guardarProductos] Error al guardar productos:', error);
    }
  }

  public static restablecerProductosPredeterminados(): Producto[] {
    const iniciales = [...PRODUCTOS_INICIALES];
    this.guardarProductos(iniciales);
    return iniciales;
  }

  public static obtenerPedidosCocina(): PedidoCocina[] {
    try {
      const serializado = localStorage.getItem(CLAVES_STORAGE.PEDIDOS_COCINA);
      if (!serializado) return [];
      return JSON.parse(serializado) as PedidoCocina[];
    } catch (error: unknown) {
      console.error('[RepositorioStorage.obtenerPedidosCocina] Error al recuperar pedidos cocina:', error);
      return [];
    }
  }

  public static guardarPedidosCocina(pedidos: PedidoCocina[]): void {
    try {
      localStorage.setItem(CLAVES_STORAGE.PEDIDOS_COCINA, JSON.stringify(pedidos));
    } catch (error: unknown) {
      console.error('[RepositorioStorage.guardarPedidosCocina] Error al guardar pedidos cocina:', error);
    }
  }

  /* ==========================================================================
     MÉTODOS DE CONTROL DE INVENTARIO
     ========================================================================== */

  public static obtenerInventario(): ItemInventario[] {
    try {
      const serializado = localStorage.getItem(CLAVES_STORAGE.INVENTARIO);
      if (serializado) {
        const datos = JSON.parse(serializado) as unknown;
        if (Array.isArray(datos) && datos.length > 0) {
          return datos as ItemInventario[];
        }
      }
      const iniciales = [...INVENTARIO_INICIAL];
      this.guardarInventario(iniciales);
      return iniciales;
    } catch (error: unknown) {
      console.error('[RepositorioStorage.obtenerInventario] Error al cargar inventario:', error);
      return [...INVENTARIO_INICIAL];
    }
  }

  public static guardarInventario(items: ItemInventario[]): void {
    try {
      localStorage.setItem(CLAVES_STORAGE.INVENTARIO, JSON.stringify(items));
    } catch (error: unknown) {
      console.error('[RepositorioStorage.guardarInventario] Error al guardar inventario:', error);
    }
  }

  public static obtenerMovimientosInventario(): MovimientoInventario[] {
    try {
      const serializado = localStorage.getItem(CLAVES_STORAGE.MOVIMIENTOS_INVENTARIO);
      if (!serializado) return [];
      return JSON.parse(serializado) as MovimientoInventario[];
    } catch (error: unknown) {
      console.error('[RepositorioStorage.obtenerMovimientosInventario] Error al cargar movimientos:', error);
      return [];
    }
  }

  public static registrarMovimientoInventario(movimiento: MovimientoInventario): void {
    try {
      const movimientos = this.obtenerMovimientosInventario();
      movimientos.unshift(movimiento);
      // Limitar a los últimos 300 movimientos para cuidar almacenamiento local
      const recortados = movimientos.slice(0, 300);
      localStorage.setItem(CLAVES_STORAGE.MOVIMIENTOS_INVENTARIO, JSON.stringify(recortados));
    } catch (error: unknown) {
      console.error('[RepositorioStorage.registrarMovimientoInventario] Error al registrar movimiento:', error);
    }
  }

  /* ==========================================================================
     MÉTODOS DE AVISOS DE RESURTIDO DE BARRA A COCINA
     ========================================================================== */

  public static obtenerAvisosBarra(): AvisoBarra[] {
    try {
      const serializado = localStorage.getItem(CLAVES_STORAGE.AVISOS_BARRA);
      if (serializado) {
        return JSON.parse(serializado) as AvisoBarra[];
      }
      return [...AVISOS_BARRA_INICIALES];
    } catch (error: unknown) {
      console.error('[RepositorioStorage.obtenerAvisosBarra] Error al cargar avisos de barra:', error);
      return [];
    }
  }

  public static guardarAvisosBarra(avisos: AvisoBarra[]): void {
    try {
      localStorage.setItem(CLAVES_STORAGE.AVISOS_BARRA, JSON.stringify(avisos));
    } catch (error: unknown) {
      console.error('[RepositorioStorage.guardarAvisosBarra] Error al guardar avisos de barra:', error);
    }
  }
}
