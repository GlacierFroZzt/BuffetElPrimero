import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Settings2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import type { Mesa, TipoArea } from '../types';
import { useRestaurante } from '../context/RestauranteContext';
import { formatearMoneda, formatearTiempoTranscurrido } from '../utils/formateadores';
import { gestorNavegacion } from '../utils/navegacionDispositivo';
import { ModalRenombrarMesa } from './ModalRenombrarMesa';
import { ModalMoverMesa } from './ModalMoverMesa';

type FiltroZona = TipoArea | 'todas';

interface MensajeFeedback {
  tipo: 'exito' | 'error' | 'info';
  texto: string;
}

export const DashboardMesas: React.FC = () => {
  const {
    mesas,
    seleccionarMesa,
    abrirMesa,
    actualizarBuffetsMesa,
    agregarMesa,
    eliminarMesa,
    agregarDomicilio,
    eliminarDomicilio,
    liberarMesaManual,
    meseroActual,
  } = useRestaurante();

  const [filtroArea, setFiltroArea] = useState<FiltroZona>('todas');
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [mensajeFeedback, setMensajeFeedback] = useState<MensajeFeedback | null>(null);

  // Estados de apertura de mesa buffet
  const [mesaParaAbrir, setMesaParaAbrir] = useState<Mesa | null>(null);
  const [adultosParaAbrir, setAdultosParaAbrir] = useState<number>(2);
  const [ninosParaAbrir, setNinosParaAbrir] = useState<number>(0);

  const [mesaParaRenombrar, setMesaParaRenombrar] = useState<Mesa | null>(null);
  const [mesaParaMover, setMesaParaMover] = useState<Mesa | null>(null);

  const mostrarMensaje = (texto: string, tipo: 'exito' | 'error' | 'info'): void => {
    setMensajeFeedback({ texto, tipo });
    setTimeout(() => {
      setMensajeFeedback((actual) => (actual?.texto === texto ? null : actual));
    }, 3200);
  };

  const mesasFiltradas = mesas.filter((m) => {
    if (filtroArea === 'todas') return true;
    return m.area === filtroArea;
  });

  const libres = mesas.filter((m) => m.estado === 'libre').length;
  const ocupadas = mesas.filter((m) => m.estado === 'ocupada').length;
  const porCobrar = mesas.filter((m) => m.estado === 'por_cobrar').length;

  const handleMesaClick = (mesa: Mesa): void => {
    if (modoEdicion) return;
    if (mesa.estado === 'libre') {
      setMesaParaAbrir(mesa);
      setAdultosParaAbrir(mesa.area === 'domicilio' ? 0 : 2);
      setNinosParaAbrir(0);
      return;
    }
    seleccionarMesa(mesa);
  };

  const handleConfirmarApertura = (): void => {
    if (!mesaParaAbrir) return;
    const mesaObjetivo = mesaParaAbrir;
    const totalComensales = adultosParaAbrir + ninosParaAbrir;
    setMesaParaAbrir(null);

    abrirMesa(mesaObjetivo.id);

    // Si es del salón buffet y se seleccionaron adultos o niños, precargar a la comanda
    if (mesaObjetivo.area !== 'domicilio' && totalComensales > 0) {
      actualizarBuffetsMesa(mesaObjetivo.id, adultosParaAbrir, ninosParaAbrir);
    }

    seleccionarMesa({ ...mesaObjetivo, capacidad: Math.max(1, totalComensales) });
    mostrarMensaje(
      `Se abrió "${mesaObjetivo.nombre}"${
        totalComensales > 0 ? ` con ${adultosParaAbrir} adultos y ${ninosParaAbrir} niños` : ''
      }.`,
      'exito'
    );
  };

  const handleCancelarApertura = (): void => {
    setMesaParaAbrir(null);
  };

  useEffect(() => {
    if (mesaParaAbrir) {
      return gestorNavegacion.empujarPaso('modal-confirmar-apertura', handleCancelarApertura);
    }
  }, [mesaParaAbrir]);

  useEffect(() => {
    if (!mesaParaAbrir) return;
    const manejarKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmarApertura();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelarApertura();
      }
    };
    window.addEventListener('keydown', manejarKeyDown);
    return () => window.removeEventListener('keydown', manejarKeyDown);
  }, [mesaParaAbrir, adultosParaAbrir, ninosParaAbrir]);

  const handleAgregarMesa = (): void => {
    const nueva = agregarMesa(4);
    mostrarMensaje(`Se agregó "${nueva.nombre}".`, 'exito');
  };

  const handleAgregarDomicilio = (): void => {
    const nuevo = agregarDomicilio();
    mostrarMensaje(`Se agregó "${nuevo.nombre}".`, 'exito');
  };

  const handleEliminarElemento = (e: React.MouseEvent, mesa: Mesa): void => {
    e.stopPropagation();
    let resultado: { exito: boolean; mensaje: string };
    if (mesa.area === 'domicilio') {
      resultado = eliminarDomicilio(mesa.id);
    } else {
      resultado = eliminarMesa(mesa.id);
    }
    mostrarMensaje(resultado.mensaje, resultado.exito ? 'exito' : 'error');
  };

  const handleLiberarMesaForzada = (e: React.MouseEvent, mesa: Mesa): void => {
    e.stopPropagation();
    liberarMesaManual(mesa.id);
    mostrarMensaje(`Se canceló la comanda y se liberó "${mesa.nombre}".`, 'exito');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto overscroll-contain pb-24 bg-slate-50 text-slate-800">
      {/* Toast Feedback */}
      {mensajeFeedback && (
        <div
          className={`fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-bold border transition-all animate-in fade-in slide-in-from-top-3 ${
            mensajeFeedback.tipo === 'exito'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-900/10'
              : mensajeFeedback.tipo === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-rose-900/10'
              : 'bg-blue-50 border-blue-300 text-blue-900 shadow-blue-900/10'
          }`}
        >
          {mensajeFeedback.tipo === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{mensajeFeedback.texto}</span>
        </div>
      )}

      {/* Barra de Control y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Filtros de Área */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFiltroArea('todas')}
            className={`py-1.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
              filtroArea === 'todas'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Todas ({mesas.length})
          </button>

          <button
            type="button"
            onClick={() => setFiltroArea('mesa')}
            className={`py-1.5 px-3 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              filtroArea === 'mesa'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Salón Buffet ({mesas.filter((m) => m.area === 'mesa').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroArea('domicilio')}
            className={`py-1.5 px-3 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              filtroArea === 'domicilio'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Para Llevar ({mesas.filter((m) => m.area === 'domicilio').length})</span>
          </button>
        </div>

        {/* Semáforo de Estado y Botones de Creación */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{libres} Libres</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>{ocupadas} En Servicio</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>{porCobrar} Por Cobrar</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAgregarMesa}
              className="py-1.5 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Agregar nueva mesa al salón"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">+ Mesa</span>
            </button>

            <button
              type="button"
              onClick={handleAgregarDomicilio}
              className="py-1.5 px-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Agregar pedido para llevar"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">+ Llevar</span>
            </button>

            <button
              type="button"
              onClick={() => setModoEdicion((prev) => !prev)}
              className={`p-1.5 sm:py-1.5 sm:px-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                modoEdicion
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title="Gestionar mesas"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{modoEdicion ? 'Listo' : 'Gestionar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 flex-1">
        {mesasFiltradas.map((mesa) => {
          const esLibre = mesa.estado === 'libre';
          const esPorCobrar = mesa.estado === 'por_cobrar';
          const esLlevar = mesa.area === 'domicilio';

          if (esLibre) {
            return (
              <div
                key={mesa.id}
                onClick={() => handleMesaClick(mesa)}
                className={`group relative rounded-3xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer border select-none transition-all duration-150 active:scale-95 min-h-[145px] bg-white shadow-xs ${
                  modoEdicion
                    ? 'border-dashed border-amber-400 bg-amber-50/20'
                    : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                {/* Opciones en modo gestión */}
                {modoEdicion && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMesaParaRenombrar(mesa);
                      }}
                      className="p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleEliminarElemento(e, mesa)}
                      className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-black text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5 truncate">
                    {esLlevar ? (
                      <ShoppingBag className="w-4 h-4 text-cyan-600 shrink-0" />
                    ) : (
                      <Users className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                    <span className="truncate">{mesa.nombre}</span>
                  </span>

                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" title="Disponible" />
                </div>

                <div className="my-auto py-2 text-center">
                  <span className="text-xs text-slate-400 font-semibold">
                    {esLlevar ? 'Pedido para llevar / mostrador' : `Capacidad sugerida: ${mesa.capacidad} personas`}
                  </span>
                </div>

                <div className="text-center pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                    {esLlevar ? '+ Abrir Pedido Llevar' : '+ Abrir Mesa Buffet'}
                  </span>
                </div>
              </div>
            );
          }

          // Mesa Ocupada o Por Cobrar
          return (
            <div
              key={mesa.id}
              onClick={() => handleMesaClick(mesa)}
              className={`group relative rounded-3xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer border select-none transition-all duration-150 active:scale-95 min-h-[145px] shadow-sm ${
                esPorCobrar
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40'
                  : 'bg-blue-50/60 border-blue-200 hover:border-blue-400'
              }`}
            >
              {/* Opciones en modo gestión */}
              {modoEdicion && (
                <div className="absolute -top-2 -right-2 flex items-center gap-1 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMesaParaRenombrar(mesa);
                    }}
                    className="p-1.5 rounded-full bg-blue-600 text-white shadow-md cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleLiberarMesaForzada(e, mesa)}
                    className="p-1.5 rounded-full bg-rose-600 text-white shadow-md cursor-pointer"
                    title="Liberar mesa forzadamente"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Cabecera */}
              <div className="flex items-center justify-between gap-1.5">
                <span className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-1.5 truncate">
                  {esLlevar ? (
                    <ShoppingBag className="w-4 h-4 text-cyan-600 shrink-0" />
                  ) : (
                    <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                  <span className="truncate">{mesa.nombre}</span>
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    esPorCobrar
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {esPorCobrar ? 'Por Cobrar' : 'Ocupada'}
                </span>
              </div>

              {/* Centro: Total y Comensales */}
              <div className="my-auto py-2 text-center">
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {formatearMoneda(mesa.totalParcial)}
                </div>
                {mesa.horaApertura && (
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatearTiempoTranscurrido(mesa.horaApertura)}
                  </span>
                )}
              </div>

              {/* Pie: Botón Ver Cuenta */}
              <div className="text-center pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold truncate">
                  {mesa.meseroAsignado || meseroActual}
                </span>
                <span className="font-black text-blue-600 hover:text-blue-700">
                  Ver Cuenta →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================================
          MODAL DE CONFIRMACIÓN Y APERTURA DE MESA BUFFET
          ====================================================================== */}
      {mesaParaAbrir && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={handleCancelarApertura}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm sm:max-w-md bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95"
          >
            <button
              type="button"
              onClick={handleCancelarApertura}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-3 shadow-inner ${
                mesaParaAbrir.area === 'domicilio'
                  ? 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}
            >
              {mesaParaAbrir.area === 'domicilio' ? (
                <ShoppingBag className="w-8 h-8 stroke-[2.2]" />
              ) : (
                <Users className="w-8 h-8 stroke-[2.2]" />
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
              Abrir {mesaParaAbrir.nombre}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mb-4">
              {mesaParaAbrir.area === 'domicilio'
                ? '¿Deseas iniciar este pedido para llevar para registrar kilos de pollo asado, barbacoa o tacos?'
                : 'Indica cuántos adultos y niños se sientan para iniciar el buffet:'}
            </p>

            {/* Selector rápido de Comensales Buffet */}
            {mesaParaAbrir.area !== 'domicilio' && (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 flex flex-col gap-3">
                {/* Conteo Adultos */}
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-black text-slate-800 block">Buffet Adultos ($180)</span>
                    <span className="text-[11px] text-slate-500">Comensales mayores</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdultosParaAbrir((a) => Math.max(0, a - 1))}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-base font-black text-blue-700">
                      {adultosParaAbrir}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdultosParaAbrir((a) => a + 1)}
                      className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 my-1" />

                {/* Conteo Niños */}
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-black text-slate-800 block">Buffet Niños ($95)</span>
                    <span className="text-[11px] text-slate-500">Menores de 10 años</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNinosParaAbrir((n) => Math.max(0, n - 1))}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-base font-black text-blue-700">
                      {ninosParaAbrir}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNinosParaAbrir((n) => n + 1)}
                      className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="w-full flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmarApertura}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                <span>
                  {mesaParaAbrir.area === 'domicilio' ? 'Iniciar Pedido Llevar' : 'Abrir Mesa e Iniciar Buffet'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCancelarApertura}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales Renombrar y Mover */}
      <ModalRenombrarMesa
        mesa={mesaParaRenombrar}
        isOpen={Boolean(mesaParaRenombrar)}
        onClose={() => setMesaParaRenombrar(null)}
        onExito={(nuevo) => mostrarMensaje(`Se actualizó a "${nuevo}".`, 'exito')}
      />

      <ModalMoverMesa
        mesaOrigen={mesaParaMover}
        isOpen={Boolean(mesaParaMover)}
        onClose={() => setMesaParaMover(null)}
        onExito={(destino) => mostrarMensaje(`Se movió a "${destino.nombre}".`, 'exito')}
      />
    </div>
  );
};

export default DashboardMesas;
