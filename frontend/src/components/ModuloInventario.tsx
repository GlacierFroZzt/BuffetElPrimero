import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  CupSoda,
  Beef,
  History,
  X,
  Edit2,
  Trash2,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type {
  ItemInventario,
  TipoItemInventario,
  UnidadMedida,
} from '../types';
import { useRestaurante } from '../context/RestauranteContext';
import { formatearMoneda, formatearFechaHora } from '../utils/formateadores';

export const ModuloInventario: React.FC = () => {
  const {
    inventario,
    movimientosInventario,
    agregarItemInventario,
    actualizarItemInventario,
    eliminarItemInventario,
    registrarEntradaInventario,
    registrarSalidaInventario,
  } = useRestaurante();

  const [pestanaActiva, setPestanaActiva] = useState<'refrescos' | 'ingredientes' | 'movimientos'>('refrescos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroStockBajo, setFiltroStockBajo] = useState<boolean>(false);

  // Estados de modales
  const [modalEntradaItem, setModalEntradaItem] = useState<ItemInventario | null>(null);
  const [cantidadEntrada, setCantidadEntrada] = useState<string>('');
  const [motivoEntrada, setMotivoEntrada] = useState<string>('Compra a proveedor');
  const [costoEntrada, setCostoEntrada] = useState<string>('');

  const [modalSalidaItem, setModalSalidaItem] = useState<ItemInventario | null>(null);
  const [cantidadSalida, setCantidadSalida] = useState<string>('');
  const [motivoSalida, setMotivoSalida] = useState<string>('Merma / caducidad');
  const [tipoSalida, setTipoSalida] = useState<'merma' | 'ajuste'>('merma');

  const [modalItemForm, setModalItemForm] = useState<ItemInventario | 'nuevo' | null>(null);
  const [formNombre, setFormNombre] = useState<string>('');
  const [formCodigo, setFormCodigo] = useState<string>('');
  const [formTipo, setFormTipo] = useState<TipoItemInventario>('refresco');
  const [formUnidad, setFormUnidad] = useState<UnidadMedida>('pza');
  const [formStockActual, setFormStockActual] = useState<string>('0');
  const [formStockMinimo, setFormStockMinimo] = useState<string>('5');
  const [formCostoUnitario, setFormCostoUnitario] = useState<string>('0');

  // Estadísticas globales
  const totalItems = inventario.length;
  const itemsBajos = useMemo(
    () => inventario.filter((item) => item.stockActual <= item.stockMinimo),
    [inventario]
  );
  const totalRefrescosPiezas = useMemo(
    () =>
      inventario
        .filter((item) => item.tipo === 'refresco')
        .reduce((acc, item) => acc + item.stockActual, 0),
    [inventario]
  );

  // Filtrado de items
  const itemsFiltrados = useMemo(() => {
    return inventario.filter((item) => {
      if (pestanaActiva === 'refrescos' && item.tipo !== 'refresco') return false;
      if (pestanaActiva === 'ingredientes' && item.tipo !== 'ingrediente') return false;
      if (filtroStockBajo && item.stockActual > item.stockMinimo) return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        return (
          item.nombre.toLowerCase().includes(q) ||
          (item.codigo && item.codigo.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [inventario, pestanaActiva, filtroStockBajo, busqueda]);

  const abrirModalNuevo = () => {
    setFormNombre('');
    setFormCodigo('');
    setFormTipo(pestanaActiva === 'ingredientes' ? 'ingrediente' : 'refresco');
    setFormUnidad(pestanaActiva === 'ingredientes' ? 'kg' : 'pza');
    setFormStockActual('0');
    setFormStockMinimo('5');
    setFormCostoUnitario('0');
    setModalItemForm('nuevo');
  };

  const abrirModalEditar = (item: ItemInventario) => {
    setFormNombre(item.nombre);
    setFormCodigo(item.codigo || '');
    setFormTipo(item.tipo);
    setFormUnidad(item.unidad);
    setFormStockActual(String(item.stockActual));
    setFormStockMinimo(String(item.stockMinimo));
    setFormCostoUnitario(String(item.costoUnitario || 0));
    setModalItemForm(item);
  };

  const handleGuardarForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) return;

    const stockActualNum = parseFloat(formStockActual) || 0;
    const stockMinimoNum = parseFloat(formStockMinimo) || 0;
    const costoNum = parseFloat(formCostoUnitario) || 0;

    if (modalItemForm === 'nuevo') {
      agregarItemInventario({
        nombre: formNombre.trim(),
        codigo: formCodigo.trim() || undefined,
        tipo: formTipo,
        unidad: formUnidad,
        stockActual: stockActualNum,
        stockMinimo: stockMinimoNum,
        costoUnitario: costoNum,
      });
    } else if (modalItemForm && typeof modalItemForm === 'object') {
      actualizarItemInventario(modalItemForm.id, {
        nombre: formNombre.trim(),
        codigo: formCodigo.trim() || undefined,
        tipo: formTipo,
        unidad: formUnidad,
        stockActual: stockActualNum,
        stockMinimo: stockMinimoNum,
        costoUnitario: costoNum,
      });
    }
    setModalItemForm(null);
  };

  const handleConfirmarEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEntradaItem) return;
    const cant = parseFloat(cantidadEntrada);
    if (!cant || cant <= 0) return;

    const costo = costoEntrada ? parseFloat(costoEntrada) : undefined;
    registrarEntradaInventario(modalEntradaItem.id, cant, motivoEntrada.trim(), costo);
    setModalEntradaItem(null);
    setCantidadEntrada('');
  };

  const handleConfirmarSalida = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSalidaItem) return;
    const cant = parseFloat(cantidadSalida);
    if (!cant || cant <= 0) return;

    registrarSalidaInventario(modalSalidaItem.id, cant, motivoSalida.trim(), tipoSalida);
    setModalSalidaItem(null);
    setCantidadSalida('');
  };

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-slate-50 text-slate-800 overflow-hidden select-none">
      {/* Encabezado y Métricas Rápidas */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4 shadow-xs shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Boxes className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Control de Inventario
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Existencias en tiempo real de refrescos y materias primas del buffet
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={abrirModalNuevo}
              className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Artículo</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Resumen Numérico */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-3 sm:mt-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100/60 text-blue-700 shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
                Artículos Activos
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900">
                {totalItems} <span className="text-xs font-normal text-slate-500">en catálogo</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-100/60 text-cyan-700 shrink-0">
              <CupSoda className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
                Refrescos en Stock
              </span>
              <span className="text-base sm:text-lg font-black text-cyan-800">
                {totalRefrescosPiezas} <span className="text-xs font-normal text-slate-500">pzas</span>
              </span>
            </div>
          </div>

          <div
            onClick={() => setFiltroStockBajo((prev) => !prev)}
            className={`border rounded-xl p-2.5 sm:p-3 flex items-center gap-3 cursor-pointer transition-all active:scale-95 ${
              itemsBajos.length > 0
                ? filtroStockBajo
                  ? 'bg-amber-100 border-amber-400 text-amber-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100/60'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
            title="Haz clic para filtrar artículos con existencias bajas"
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                itemsBajos.length > 0
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider block truncate">
                {itemsBajos.length > 0 ? 'Stock Bajo / Alertas' : 'Stock Óptimo'}
              </span>
              <span className="text-base sm:text-lg font-black">
                {itemsBajos.length}{' '}
                <span className="text-xs font-normal opacity-75">
                  {itemsBajos.length === 1 ? 'artículo' : 'artículos'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Selector de Pestañas y Filtros */}
      <div className="px-4 py-2.5 sm:px-6 bg-slate-100/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setPestanaActiva('refrescos')}
            className={`py-1.5 px-3 sm:px-4 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              pestanaActiva === 'refrescos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <CupSoda className="w-4 h-4" />
            <span>Refrescos y Bebidas</span>
          </button>

          <button
            type="button"
            onClick={() => setPestanaActiva('ingredientes')}
            className={`py-1.5 px-3 sm:px-4 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              pestanaActiva === 'ingredientes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Beef className="w-4 h-4" />
            <span>Ingredientes y Materias Primas</span>
          </button>

          <button
            type="button"
            onClick={() => setPestanaActiva('movimientos')}
            className={`py-1.5 px-3 sm:px-4 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              pestanaActiva === 'movimientos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Movimientos ({movimientosInventario.length})</span>
          </button>
        </div>

        {pestanaActiva !== 'movimientos' && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {filtroStockBajo && (
              <button
                type="button"
                onClick={() => setFiltroStockBajo(false)}
                className="py-1.5 px-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <span>Solo bajo</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
        {pestanaActiva === 'movimientos' ? (
          /* TABLA DE HISTORIAL DE MOVIMIENTOS */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Registro Cronológico de Movimientos
                </h3>
                <p className="text-xs text-slate-500">
                  Entradas por compra, descuentos automáticos por comanda y mermas
                </p>
              </div>
            </div>

            {movimientosInventario.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay movimientos registrados en este turno.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">Fecha y Hora</th>
                      <th className="py-2.5 px-4">Artículo</th>
                      <th className="py-2.5 px-4">Tipo Movimiento</th>
                      <th className="py-2.5 px-4 text-center">Cantidad</th>
                      <th className="py-2.5 px-4 text-center">Stock Resultante</th>
                      <th className="py-2.5 px-4">Motivo / Detalle</th>
                      <th className="py-2.5 px-4">Usuario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {movimientosInventario.map((mov) => {
                      const esEntrada = mov.tipoMovimiento === 'entrada_compra';
                      const esVenta = mov.tipoMovimiento === 'salida_venta';
                      return (
                        <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                            {formatearFechaHora(mov.fecha)}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            {mov.nombreItem}
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            {esEntrada && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                                <ArrowUpRight className="w-3 h-3" /> Entrada Compra
                              </span>
                            )}
                            {esVenta && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-black text-[10px]">
                                <ArrowDownRight className="w-3 h-3" /> Venta en Mesa
                              </span>
                            )}
                            {mov.tipoMovimiento === 'merma' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-[10px]">
                                <ArrowDownRight className="w-3 h-3" /> Merma
                              </span>
                            )}
                            {mov.tipoMovimiento === 'ajuste' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-[10px]">
                                Ajuste Manual
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center font-black">
                            <span
                              className={
                                esEntrada
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }
                            >
                              {esEntrada ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold text-slate-700">
                            {mov.stockPosterior}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">
                            {mov.motivo}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                            {mov.usuario || 'Sistema'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* LISTA DE TARJETAS DE ARTÍCULOS */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {itemsFiltrados.map((item) => {
              const estaBajo = item.stockActual <= item.stockMinimo;
              const estaAgotado = item.stockActual <= 0;
              const porcentaje =
                item.stockMinimo > 0
                  ? Math.min(100, Math.round((item.stockActual / (item.stockMinimo * 2.5)) * 100))
                  : 100;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col justify-between ${
                    estaAgotado
                      ? 'border-rose-300 ring-1 ring-rose-300/40'
                      : estaBajo
                      ? 'border-amber-300 ring-1 ring-amber-300/40'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div>
                    {/* Fila Superior: Badge estado y código */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {item.codigo && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                            {item.codigo}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                          {item.tipo}
                        </span>
                      </div>

                      {estaAgotado ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] animate-pulse">
                          AGOTADO
                        </span>
                      ) : estaBajo ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px]">
                          STOCK BAJO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Óptimo
                        </span>
                      )}
                    </div>

                    {/* Nombre y Costo */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-sm text-slate-900 leading-snug">
                        {item.nombre}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(item)}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar artículo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar ${item.nombre} del inventario?`)) {
                              eliminarItemInventario(item.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar artículo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Nivel de Stock y Barra */}
                    <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-500">
                          Existencia actual:
                        </span>
                        <div className="text-right">
                          <span
                            className={`text-xl font-black ${
                              estaAgotado
                                ? 'text-rose-600'
                                : estaBajo
                                ? 'text-amber-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {item.stockActual}
                          </span>
                          <span className="text-xs font-bold text-slate-500 ml-1">
                            {item.unidad}
                          </span>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${porcentaje}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            estaAgotado
                              ? 'bg-rose-500'
                              : estaBajo
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1.5">
                        <span>Mínimo: {item.stockMinimo} {item.unidad}</span>
                        {item.costoUnitario ? (
                          <span>Costo: {formatearMoneda(item.costoUnitario)}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Botonera de Acciones de Entrada / Salida */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setModalEntradaItem(item);
                        setCantidadEntrada('');
                        setMotivoEntrada('Compra a proveedor');
                        setCostoEntrada(item.costoUnitario ? String(item.costoUnitario) : '');
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+ Entrada</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setModalSalidaItem(item);
                        setCantidadSalida('');
                        setMotivoSalida('Merma / caducidad');
                        setTipoSalida('merma');
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                      <span>- Merma/Ajuste</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================================
          MODAL: REGISTRAR ENTRADA (COMPRA)
          ====================================================================== */}
      {modalEntradaItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500 text-white">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Registrar Entrada</h3>
                  <p className="text-xs text-slate-600">{modalEntradaItem.nombre}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalEntradaItem(null)}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarEntrada} className="p-4 sm:p-5 flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cantidad a ingresar ({modalEntradaItem.unidad}):
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  autoFocus
                  placeholder={`Ej. 10 ${modalEntradaItem.unidad}`}
                  value={cantidadEntrada}
                  onChange={(e) => setCantidadEntrada(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo / Proveedor:
                </label>
                <input
                  type="text"
                  required
                  value={motivoEntrada}
                  onChange={(e) => setMotivoEntrada(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Costo unitario de compra ($):
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Opcional"
                  value={costoEntrada}
                  onChange={(e) => setCostoEntrada(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between font-bold">
                <span className="text-slate-500">Stock Actual: {modalEntradaItem.stockActual}</span>
                <span className="text-emerald-700">
                  Nuevo Stock: {modalEntradaItem.stockActual + (parseFloat(cantidadEntrada) || 0)}{' '}
                  {modalEntradaItem.unidad}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEntradaItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  Guardar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL: REGISTRAR SALIDA / MERMA
          ====================================================================== */}
      {modalSalidaItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500 text-white">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Registrar Salida / Merma</h3>
                  <p className="text-xs text-slate-600">{modalSalidaItem.nombre}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalSalidaItem(null)}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarSalida} className="p-4 sm:p-5 flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo de Descuento:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoSalida('merma')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      tipoSalida === 'merma'
                        ? 'bg-rose-100 border-rose-400 text-rose-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Merma / Caducado
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoSalida('ajuste')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      tipoSalida === 'ajuste'
                        ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Ajuste por Conteo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cantidad a descontar ({modalSalidaItem.unidad}):
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  autoFocus
                  placeholder={`Ej. 2 ${modalSalidaItem.unidad}`}
                  value={cantidadSalida}
                  onChange={(e) => setCantidadSalida(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-base focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo / Justificación:
                </label>
                <input
                  type="text"
                  required
                  value={motivoSalida}
                  onChange={(e) => setMotivoSalida(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between font-bold">
                <span className="text-slate-500">Stock Actual: {modalSalidaItem.stockActual}</span>
                <span className="text-rose-700">
                  Nuevo Stock:{' '}
                  {Math.max(0, modalSalidaItem.stockActual - (parseFloat(cantidadSalida) || 0))}{' '}
                  {modalSalidaItem.unidad}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSalidaItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 cursor-pointer"
                >
                  Guardar Salida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL: NUEVO O EDITAR ARTÍCULO DE INVENTARIO
          ====================================================================== */}
      {modalItemForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {modalItemForm === 'nuevo' ? 'Nuevo Artículo de Inventario' : 'Editar Artículo'}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Define existencias, unidad de medida y umbrales mínimos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalItemForm(null)}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarForm} className="p-4 sm:p-5 flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Artículo *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Coca-Cola 600ml o Pollo Asado Crudo"
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código Interno / SKU:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. REF-010 o ING-005"
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Artículo:
                  </label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as TipoItemInventario)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="refresco">Refresco / Bebida</option>
                    <option value="ingrediente">Ingrediente / Materia Prima</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unidad de Medida:
                  </label>
                  <select
                    value={formUnidad}
                    onChange={(e) => setFormUnidad(e.target.value as UnidadMedida)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="pza">Pieza (pza)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="lt">Litro (lt)</option>
                    <option value="porcion">Porción</option>
                    <option value="caja">Caja</option>
                    <option value="reja">Reja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Actual:
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formStockActual}
                    onChange={(e) => setFormStockActual(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Mínimo (Alerta):
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formStockMinimo}
                    onChange={(e) => setFormStockMinimo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Costo Unitario ($):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formCostoUnitario}
                    onChange={(e) => setFormCostoUnitario(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalItemForm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Guardar Artículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
