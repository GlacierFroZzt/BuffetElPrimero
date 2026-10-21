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
      {/* Encabezado */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4 shadow-xs shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <ChefHat className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Avisos de Resurtido a Cocina
            </h2>
            {avisosPendientes.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-xs animate-pulse">
                {avisosPendientes.length} pendiente{avisosPendientes.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comunica en 1 toque a cocina los guisados, carnes o guarniciones que están bajos en la barra
          </p>
        </div>

        {/* Nivel de Urgencia para los siguientes avisos */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 px-2">Prioridad:</span>
          <button
            type="button"
            onClick={() => setUrgenciaSeleccionada('bajo')}
            className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              urgenciaSeleccionada === 'bajo'
                ? 'bg-amber-400 text-amber-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🟡 Queda poco
          </button>

          <button
            type="button"
            onClick={() => setUrgenciaSeleccionada('medio')}
            className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              urgenciaSeleccionada === 'medio'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🟠 Bajo
          </button>

          <button
            type="button"
            onClick={() => setUrgenciaSeleccionada('urgente')}
            className={`py-1.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
              urgenciaSeleccionada === 'urgente'
                ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔴 ¡VACÍO / YA!
          </button>
        </div>
      </header>

      {/* Cuerpo en dos columnas (Panel de Envío Rápido + Monitor de Avisos Activos) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* COLUMNA 1: BOTONERA DE ENVÍO RÁPIDO DE PLATILLOS */}
        <div className="w-full lg:w-[480px] xl:w-[540px] border-r border-slate-200 bg-white flex flex-col overflow-hidden shrink-0">
          <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              Toca para mandar aviso inmediato:
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4">
            {/* Cuadrícula de platillos frecuentes */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
              {PLATILLOS_BARRA_PREDEFINIDOS.map((platillo) => (
                <button
                  key={platillo}
                  type="button"
                  onClick={() => handleEnviarAviso(platillo)}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 text-left transition-all active:scale-95 cursor-pointer shadow-2xs group flex flex-col justify-between min-h-[72px]"
                >
                  <span className="font-black text-xs text-slate-800 group-hover:text-blue-700 leading-snug">
                    {platillo}
                  </span>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 group-hover:text-blue-500 font-bold">
                      Avisar a cocina
                    </span>
                    <Send className="w-3.5 h-3.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>

            {/* Otro platillo manual */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200">
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
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleEnviarAviso(platilloPersonalizado)}
                  disabled={!platilloPersonalizado.trim()}
                  className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: MONITOR DE AVISOS ACTIVOS EN COCINA */}
        <div className="flex-1 min-h-0 flex flex-col bg-slate-100/70 overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-blue-600" />
              <h3 className="font-black text-sm text-slate-800">
                Avisos Activos en Barra ({avisosPendientes.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              La cocina ve esto para resurtir
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3">
            {avisosPendientes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="p-4 rounded-3xl bg-white border border-slate-200 text-emerald-500 mb-3 shadow-xs">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="font-black text-slate-700 text-base">Barra al 100% Surtida</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  No hay reportes de platillos bajos en este momento. Toca un platillo a la izquierda para avisar.
                </p>
              </div>
            ) : (
              avisosPendientes.map((aviso) => {
                const esUrgente = aviso.urgencia === 'urgente';
                const esMedio = aviso.urgencia === 'medio';

                return (
                  <div
                    key={aviso.id}
                    className={`p-4 rounded-2xl border transition-all shadow-md flex items-center justify-between gap-3 animate-in slide-in-from-top-2 ${
                      esUrgente
                        ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/50'
                        : esMedio
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-amber-50 border-amber-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl text-white shrink-0 ${
                          esUrgente
                            ? 'bg-rose-600 animate-bounce'
                            : esMedio
                            ? 'bg-orange-500'
                            : 'bg-amber-500'
                        }`}
                      >
                        <ChefHat className="w-5 h-5 stroke-[2.5]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              esUrgente
                                ? 'bg-rose-200 text-rose-900 animate-pulse'
                                : esMedio
                                ? 'bg-orange-200 text-orange-900'
                                : 'bg-amber-200 text-amber-900'
                            }`}
                          >
                            {esUrgente ? '¡VACÍO / URGENTE!' : esMedio ? 'Bajo en Barra' : 'Queda Poco'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatearTiempoTranscurrido(aviso.horaCreacion)}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-slate-900 mt-1 leading-snug">
                          {aviso.platillo}
                        </h4>

                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Reportado por: <strong>{aviso.creadoPor || 'Mesero'}</strong></span>
                          <span>· {formatearHoraCorta(aviso.horaCreacion)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => marcarAvisoBarraResurtido(aviso.id)}
                        className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Marcar como resurtido en barra"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        <span>¡Resurtido!</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarAvisoBarra(aviso.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
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
                  ✓ Recientemente Resurtidos:
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
