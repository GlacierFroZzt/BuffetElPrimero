import React, { useState, useMemo, memo } from 'react';
import {
  Utensils,
  Search,
  Plus,
  Minus,
  MoreVertical,
  CupSoda,
  Beef,
  Users,
} from 'lucide-react';
import type { CategoriaProducto, Producto, FormularioProductoDTO, ItemInventario } from '../types';
import { ModificadorModal } from './ModificadorModal';
import { useRestaurante } from '../context/RestauranteContext';
import { formatearMoneda } from '../utils/formateadores';
import { ModalOpcionesProducto } from './ModalOpcionesProducto';
import { ModalFormularioProducto } from './ModalFormularioProducto';
import { ModalVisorImagen } from './ModalVisorImagen';

interface ComanderoProps {
  readonly onVerCuentaMovil?: () => void;
}

interface TarjetaProductoItemProps {
  readonly prod: Producto;
  readonly itemInventario?: ItemInventario;
  readonly onSeleccionar: (prod: Producto) => void;
  readonly onAbrirOpciones: (prod: Producto) => void;
}

const TarjetaProductoItem = memo<TarjetaProductoItemProps>(({
  prod,
  itemInventario,
  onSeleccionar,
  onAbrirOpciones,
}) => {
  const tieneImagen = Boolean(prod.imagenUrl && prod.imagenUrl.trim().length > 0);
  const estaAgotado = itemInventario ? itemInventario.stockActual <= 0 : false;
  const stockBajo = itemInventario ? itemInventario.stockActual <= itemInventario.stockMinimo : false;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSeleccionar(prod)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSeleccionar(prod);
        }
      }}
      title={estaAgotado ? 'Producto agotado en inventario' : 'Toca para agregar a la comanda'}
      className={`group text-left p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between transition-all duration-150 active:scale-95 border min-h-[135px] cursor-pointer select-none relative bg-white ${
        estaAgotado
          ? 'border-slate-200 opacity-60 hover:border-slate-300'
          : 'border-slate-200 hover:border-blue-400 hover:shadow-md shadow-2xs'
      }`}
    >
      {/* Botón de 3 puntos en la esquina superior derecha */}
      <button
        type="button"
        aria-label={`Opciones de ${prod.nombre}`}
        title="Opciones del producto"
        onClick={(e) => {
          e.stopPropagation();
          onAbrirOpciones(prod);
        }}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-full z-10 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-2.5 pr-6">
        {tieneImagen && (
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
            <img
              src={prod.imagenUrl}
              alt={prod.nombre}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-black text-sm md:text-base leading-snug truncate text-slate-900 group-hover:text-blue-600 transition-colors">
              {prod.nombre}
            </h4>
          </div>

          <p className="text-xs mt-1 line-clamp-2 leading-relaxed text-slate-500">
            {prod.descripcion || 'Sin descripción detallada.'}
          </p>

          {/* Existencia en inventario si está vinculado */}
          {itemInventario && (
            <div className="mt-1.5 flex items-center gap-1.5">
              {estaAgotado ? (
                <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black">
                  Agotado (0 pzas)
                </span>
              ) : stockBajo ? (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                  Quedan {itemInventario.stockActual} pzas
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold">
                  Stock: {itemInventario.stockActual} {itemInventario.unidad}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
        <span className="font-black text-base md:text-lg text-blue-600">
          {formatearMoneda(prod.precio)}
        </span>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
          + Agregar
        </span>
      </div>
    </div>
  );
});

TarjetaProductoItem.displayName = 'TarjetaProductoItem';

export const Comandero: React.FC<ComanderoProps> = ({ onVerCuentaMovil: _onVerCuentaMovil }) => {
  const {
    mesaSeleccionada,
    agregarProductoAComanda,
    cuentaActiva,
    productos,
    inventario,
    agregarProducto,
    editarProducto,
    eliminarProducto,
    modificarCantidadItem,
  } = useRestaurante();

  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaProducto>('buffet');
  const [busqueda, setBusqueda] = useState<string>('');

  // Modales
  const [productoAComandar, setProductoAComandar] = useState<Producto | null>(null);
  const [productoSeleccionadoOpciones, setProductoSeleccionadoOpciones] = useState<Producto | null>(null);
  const [modalOpcionesAbierto, setModalOpcionesAbierto] = useState<boolean>(false);
  const [productoParaEditar, setProductoParaEditar] = useState<Producto | null>(null);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState<boolean>(false);
  const [productoParaVisor, setProductoParaVisor] = useState<Producto | null>(null);
  const [modalVisorAbierto, setModalVisorAbierto] = useState<boolean>(false);

  // Productos de Buffet especiales
  const prodBuffetAdulto = useMemo(
    () => productos.find((p) => p.id === 'prod-buffet-adulto'),
    [productos]
  );
  const prodBuffetNino = useMemo(
    () => productos.find((p) => p.id === 'prod-buffet-nino'),
    [productos]
  );

  // Conteo actual en la comanda
  const itemAdultoEnComanda = useMemo(
    () => cuentaActiva?.items.find((it) => it.productoId === 'prod-buffet-adulto'),
    [cuentaActiva]
  );
  const itemNinoEnComanda = useMemo(
    () => cuentaActiva?.items.find((it) => it.productoId === 'prod-buffet-nino'),
    [cuentaActiva]
  );

  const totalAdultos = itemAdultoEnComanda?.cantidad ?? 0;
  const totalNinos = itemNinoEnComanda?.cantidad ?? 0;

  // Mapa de inventario por id
  const mapaInventario = useMemo(() => {
    const mapa = new Map<string, ItemInventario>();
    inventario.forEach((inv) => {
      mapa.set(inv.id, inv);
      if (inv.productoVinculadoId) {
        mapa.set(inv.productoVinculadoId, inv);
      }
    });
    return mapa;
  }, [inventario]);

  // Filtrado de productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideCategoria = busqueda
        ? true
        : p.categoria === categoriaActiva;
      const coincideBusqueda =
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, busqueda, categoriaActiva]);

  if (!mesaSeleccionada) {
    return null;
  }

  const handleSeleccionarParaOrdenar = (prod: Producto): void => {
    // Si no tiene modificadores, agregar directo con cantidad 1
    if (!prod.modificadoresSugeridos || prod.modificadoresSugeridos.length === 0) {
      agregarProductoAComanda(mesaSeleccionada.id, prod, 1, '', []);
      return;
    }
    setProductoAComandar(prod);
  };

  const handleConfirmarModificador = (
    cantidad: number,
    notas: string,
    modificadores: string[]
  ): void => {
    if (productoAComandar && mesaSeleccionada) {
      agregarProductoAComanda(
        mesaSeleccionada.id,
        productoAComandar,
        cantidad,
        notas,
        modificadores
      );
      setProductoAComandar(null);
    }
  };

  const handleAjustarBuffetDirecto = (prod: Producto, delta: number) => {
    if (!mesaSeleccionada) return;
    const itemExistente = cuentaActiva?.items.find((it) => it.productoId === prod.id);

    if (itemExistente) {
      modificarCantidadItem(mesaSeleccionada.id, itemExistente.id, delta);
    } else if (delta > 0) {
      agregarProductoAComanda(mesaSeleccionada.id, prod, delta, '', []);
    }
  };

  const handleAbrirOpciones = (prod: Producto): void => {
    setProductoSeleccionadoOpciones(prod);
    setModalOpcionesAbierto(true);
  };

  const handleAbrirVisorImagen = (prod: Producto): void => {
    setProductoParaVisor(prod);
    setModalVisorAbierto(true);
  };

  const handleAbrirEditar = (prod: Producto): void => {
    setProductoParaEditar(prod);
    setModalFormularioAbierto(true);
  };

  const handleAbrirNuevo = (): void => {
    setProductoParaEditar(null);
    setModalFormularioAbierto(true);
  };

  const handleSolicitarEliminar = async (prod: Producto): Promise<void> => {
    if (window.confirm(`¿Deseas eliminar "${prod.nombre}" del menú?`)) {
      try {
        await eliminarProducto(prod.id);
        setModalOpcionesAbierto(false);
      } catch (err: unknown) {
        console.error('[Comandero.handleSolicitarEliminar] Error al eliminar:', err);
      }
    }
  };

  const handleGuardarProducto = async (datos: FormularioProductoDTO): Promise<void> => {
    if (productoParaEditar) {
      await editarProducto(productoParaEditar.id, datos);
    } else {
      await agregarProducto(datos);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-50 text-slate-800 border-r border-slate-200">
      {/* Barra de Búsqueda, Acciones y Categorías */}
      <div className="p-3 md:p-4 border-b border-slate-200 bg-white space-y-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar buffet, refresco, pollo asado, barbacoa, tacos..."
              className="w-full rounded-xl pl-11 pr-4 py-2.5 text-sm md:text-base border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded font-medium bg-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleAbrirNuevo}
            className="py-2.5 px-3 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 shrink-0 transition-all cursor-pointer"
            title="Dar de alta un nuevo platillo o bebida"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Nuevo Producto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>

        {/* Pestañas de Categorías */}
        {!busqueda && (
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setCategoriaActiva('buffet')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                categoriaActiva === 'buffet'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>1. Buffets ({totalAdultos + totalNinos})</span>
            </button>

            <button
              type="button"
              onClick={() => setCategoriaActiva('refrescos')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                categoriaActiva === 'refrescos'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
              }`}
            >
              <CupSoda className="w-4 h-4" />
              <span>2. Refrescos / Bebidas</span>
            </button>

            <button
              type="button"
              onClick={() => setCategoriaActiva('asador_extras')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                categoriaActiva === 'asador_extras'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
              }`}
            >
              <Beef className="w-4 h-4" />
              <span>3. Asador / Para Llevar</span>
            </button>

            <button
              type="button"
              onClick={() => setCategoriaActiva('guarniciones')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                categoriaActiva === 'guarniciones'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>4. Guarniciones</span>
            </button>
          </div>
        )}
      </div>

      {/* Contenido: Selector Rápido de Buffet Superior y Cuadrícula de Productos */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 flex flex-col gap-4">
        {/* PANEL DESTACADO: CONTEO RÁPIDO DE BUFFET ADULTOS Y NIÑOS */}
        {(!busqueda && (categoriaActiva === 'buffet' || mesaSeleccionada.area === 'mesa')) && (
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-blue-700/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-white/20 text-white backdrop-blur-xs">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="font-black text-sm uppercase tracking-wider text-white">
                  Conteo de Buffet para {mesaSeleccionada.nombre}
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-blue-100">
                Total comensales: {totalAdultos + totalNinos}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Tarjeta Adulto */}
              {prodBuffetAdulto && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-base text-white">Buffet Adulto</h4>
                      <span className="text-xs text-blue-200 font-bold">
                        {formatearMoneda(prodBuffetAdulto.precio)} c/u
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-white">{totalAdultos}</span>
                      <span className="text-[11px] block text-blue-200">adulto(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/15">
                    <button
                      type="button"
                      onClick={() => handleAjustarBuffetDirecto(prodBuffetAdulto, -1)}
                      disabled={totalAdultos <= 0}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white disabled:opacity-30 cursor-pointer active:scale-95 transition-all"
                      title="Quitar 1 adulto"
                    >
                      <Minus className="w-4 h-4 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAjustarBuffetDirecto(prodBuffetAdulto, 1)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs shadow-md cursor-pointer active:scale-95 transition-all"
                    >
                      + 1 Adulto
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAjustarBuffetDirecto(prodBuffetAdulto, 2)}
                      className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs cursor-pointer active:scale-95 transition-all"
                    >
                      +2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAjustarBuffetDirecto(prodBuffetAdulto, 5)}
                      className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs cursor-pointer active:scale-95 transition-all"
                    >
                      +5
                    </button>
                  </div>
                </div>
              )}

              {/* Tarjeta Niño */}
              {prodBuffetNino && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-base text-white">Buffet Niño</h4>
                      <span className="text-xs text-blue-200 font-bold">
                        {formatearMoneda(prodBuffetNino.precio)} c/u
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-white">{totalNinos}</span>
                      <span className="text-[11px] block text-blue-200">menor(es)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/15">
                    <button
                      type="button"
                      onClick={() => handleAjustarBuffetDirecto(prodBuffetNino, -1)}
                      disabled={totalNinos <= 0}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white disabled:opacity-30 cursor-pointer active:scale-95 transition-all"
                      title="Quitar 1 niño"
                    >
                      <Minus className="w-4 h-4 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAjustarBuffetDirecto(prodBuffetNino, 1)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs shadow-md cursor-pointer active:scale-95 transition-all"
                    >
                      + 1 Niño
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAjustarBuffetDirecto(prodBuffetNino, 2)}
                      className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs cursor-pointer active:scale-95 transition-all"
                    >
                      +2
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cuadrícula General de Platillos */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {busqueda
                ? `Resultados para "${busqueda}" (${productosFiltrados.length})`
                : `Productos disponibles en ${categoriaActiva} (${productosFiltrados.length})`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-3.5">
            {productosFiltrados.map((prod) => {
              const itemInv = prod.itemInventarioId
                ? mapaInventario.get(prod.itemInventarioId)
                : mapaInventario.get(prod.id);

              return (
                <TarjetaProductoItem
                  key={prod.id}
                  prod={prod}
                  itemInventario={itemInv}
                  onSeleccionar={handleSeleccionarParaOrdenar}
                  onAbrirOpciones={handleAbrirOpciones}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Modales */}
      {productoAComandar && (
        <ModificadorModal
          producto={productoAComandar}
          onCerrar={() => setProductoAComandar(null)}
          onConfirmar={handleConfirmarModificador}
        />
      )}

      {productoSeleccionadoOpciones && (
        <ModalOpcionesProducto
          producto={productoSeleccionadoOpciones}
          abierto={modalOpcionesAbierto}
          onCerrar={() => setModalOpcionesAbierto(false)}
          onEditar={handleAbrirEditar}
          onVerImagen={handleAbrirVisorImagen}
          onEliminar={handleSolicitarEliminar}
        />
      )}

      <ModalFormularioProducto
        abierto={modalFormularioAbierto}
        productoParaEditar={productoParaEditar}
        onCerrar={() => setModalFormularioAbierto(false)}
        onGuardar={handleGuardarProducto}
      />

      {productoParaVisor && (
        <ModalVisorImagen
          abierto={modalVisorAbierto}
          producto={productoParaVisor}
          onCerrar={() => setModalVisorAbierto(false)}
          onEditar={handleAbrirEditar}
        />
      )}
    </div>
  );
};
