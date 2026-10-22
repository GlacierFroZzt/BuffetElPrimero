import React, { useState } from 'react';
import {
  BellRing,
  Flame,
  CheckCircle2,
  Clock,
  Trash2,
  Send,
  ChefHat,
} from 'lucide-react';
import { useRestaurante } from '../context/RestauranteContext';
import { PLATILLOS_BARRA_PREDEFINIDOS } from '../data/inventarioInicial';
import { formatearTiempoTranscurrido, formatearHoraCorta } from '../utils/formateadores';
import type { NivelUrgenciaAviso } from '../types';

export const PantallaAvisosBarra: React.FC = () => {
  const {
    avisosBarra,
    crearAvisoBarra,
    marcarAvisoBarraResurtido,
    eliminarAvisoBarra,
  } = useRestaurante();

  const [platilloPersonalizado, setPlatilloPersonalizado] = useState<string>('');
  const [urgenciaSeleccionada, setUrgenciaSeleccionada] = useState<NivelUrgenciaAviso>('medio');
  const [notasAviso, setNotasAviso] = useState<string>('');
  const [pestanaMovil, setPestanaMovil] = useState<'reportar' | 'monitor'>('reportar');

  const avisosPendientes = avisosBarra.filter((a) => a.estado === 'pendiente');
  const avisosResurtidos = avisosBarra.filter((a) => a.estado === 'resurtido').slice(0, 10);

  const handleEnviarAviso = (platillo: string) => {
    if (!platillo.trim()) return;
    crearAvisoBarra(platillo.trim(), urgenciaSeleccionada, notasAviso.trim() || undefined);
    setPlatilloPersonalizado('');
    setNotasAviso('');
  };

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-slate-50 text-slate-800 overflow-hidden select-none">
      {/* Encabezado Responsivo */}
      <header className="bg-white border-b border-slate-200 px-3 py-2.5 sm:px-6 sm:py-3.5 shadow-xs shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
              Avisos de Barra a Cocina
            </h2>
            {avisosPendientes.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[11px] sm:text-xs animate-pulse">
                {avisosPendientes.length} pendiente{avisosPendientes.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 hidden xs:block">
            Notifica al instante a cocina qué guisados o charolas se están terminando en la barra
          </p>
        </div>

        {/* Nivel de Urgencia con scroll horizontal fluido en móvil */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 px-1.5 whitespace-nowrap">
            Urgencia:
          </span>
          <button
            type="button"
            onClick={() => setUrgenciaSeleccionada('bajo')}
            className={`py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap ${
              urgenciaSeleccionada === 'bajo'
                ? 'bg-amber-400 text-amber-950 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🟡 Poco
          </button>

          <button
            type="button"
            onClick={() => setUrgenciaSeleccionada('medio')}
            className={`py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap ${
              urgenciaSeleccionada === 'medio'
                ? 'bg-orange-500 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🟠 Bajo
          </button>

          <button
            type="button"
            onClick={() => setUrgenciaSeleccionada('urgente')}
            className={`py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap ${
              urgenciaSeleccionada === 'urgente'
                ? 'bg-rose-600 text-white shadow-xs animate-pulse font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔴 ¡VACÍO!
          </button>
        </div>
      </header>

      {/* Selector de Pestañas en Móvil (Reportar vs Monitor) */}
      <div className="flex lg:hidden bg-white border-b border-slate-200 px-3 py-1.5 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setPestanaMovil('reportar')}
          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            pestanaMovil === 'reportar'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Reportar Platillo</span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaMovil('monitor')}
          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
            pestanaMovil === 'monitor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Estado Barra</span>
          {avisosPendientes.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse">
              {avisosPendientes.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenido Principal con Scroll Fluido */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* COLUMNA 1: BOTONERA DE ENVÍO RÁPIDO DE PLATILLOS */}
        <div
          className={`w-full lg:w-[480px] xl:w-[540px] border-r border-slate-200 bg-white flex flex-col min-h-0 overflow-y-auto ${
            pestanaMovil === 'reportar' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              Toca para mandar aviso inmediato:
            </span>
            <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">
              1 toque = aviso instantáneo
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4 pb-28">
            {/* Cuadrícula de platillos frecuentes de barra con botones amplios y táctiles */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {PLATILLOS_BARRA_PREDEFINIDOS.map((platillo) => (
                <button
                  key={platillo}
                  type="button"
                  onClick={() => handleEnviarAviso(platillo)}
                  className="p-3 sm:p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50/80 hover:bg-blue-50/50 text-left transition-all active:scale-95 cursor-pointer shadow-2xs group flex flex-col justify-between min-h-[76px]"
                >
                  <span className="font-black text-xs sm:text-sm text-slate-850 group-hover:text-blue-700 leading-snug">
                    {platillo}
                  </span>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 group-hover:text-blue-600 font-bold">
                      Avisar resurtido
                    </span>
                    <Send className="w-3.5 h-3.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>

            {/* Formulario para otro platillo manual */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-100/90 border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Otro platillo o guiso específico:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. Sopa de fideo, Ensalada de coditos..."
                  value={platilloPersonalizado}
                  onChange={(e) => setPlatilloPersonalizado(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleEnviarAviso(platilloPersonalizado);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold focus:border-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleEnviarAviso(platilloPersonalizado)}
                  disabled={!platilloPersonalizado.trim()}
                  className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: MONITOR DE AVISOS ACTIVOS EN COCINA */}
        <div
          className={`flex-1 min-h-0 flex flex-col bg-slate-100/70 overflow-hidden ${
            pestanaMovil === 'monitor' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-blue-600" />
              <h3 className="font-black text-xs sm:text-sm text-slate-800">
                Avisos Activos en Barra ({avisosPendientes.length})
              </h3>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-500">
              Cocina está enterada para resurtir
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 flex flex-col gap-3 pb-28">
            {avisosPendientes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 min-h-[220px]">
                <div className="p-4 rounded-3xl bg-white border border-slate-200 text-emerald-500 mb-3 shadow-xs">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="font-black text-slate-700 text-base">Barra al 100% Surtida</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  No hay reportes de charolas bajas en este momento. Toca un platillo para avisar cuando se termine.
                </p>
              </div>
            ) : (
              avisosPendientes.map((aviso) => {
                const esUrgente = aviso.urgencia === 'urgente';
                const esMedio = aviso.urgencia === 'medio';

                return (
                  <div
                    key={aviso.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all shadow-xs flex items-center justify-between gap-3 animate-in slide-in-from-top-2 ${
                      esUrgente
                        ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/50'
                        : esMedio
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-amber-50 border-amber-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`p-2 sm:p-2.5 rounded-xl text-white shrink-0 ${
                          esUrgente
                            ? 'bg-rose-600 animate-bounce'
                            : esMedio
                            ? 'bg-orange-500'
                            : 'bg-amber-500'
                        }`}
                      >
                        <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              esUrgente
                                ? 'bg-rose-200 text-rose-900 animate-pulse'
                                : esMedio
                                ? 'bg-orange-200 text-orange-900'
                                : 'bg-amber-200 text-amber-900'
                            }`}
                          >
                            {esUrgente ? '¡VACÍO / YA!' : esMedio ? 'Bajo en Barra' : 'Queda Poco'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatearTiempoTranscurrido(aviso.horaCreacion)}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1 leading-snug">
                          {aviso.platillo}
                        </h4>

                        <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Reportado por: <strong>{aviso.creadoPor || 'Mesero'}</strong></span>
                          <span>· {formatearHoraCorta(aviso.horaCreacion)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => marcarAvisoBarraResurtido(aviso.id)}
                        className="py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        title="Marcar como resurtido en barra"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                        <span>¡Resurtido!</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarAvisoBarra(aviso.id)}
                        className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Descartar aviso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Historial reciente de resurtidos */}
            {avisosResurtidos.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  ✓ Recientemente Resurtidos en Barra:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {avisosResurtidos.map((ar) => (
                    <span
                      key={ar.id}
                      className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{ar.platillo}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
