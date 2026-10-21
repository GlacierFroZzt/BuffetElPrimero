import type { Mesa } from '../types';

export const MESAS_INICIALES: readonly Mesa[] = [
  // --- MESAS DE SALÓN BUFFET ---
  { id: 'mesa-1', numero: 1, nombre: 'Mesa 1', area: 'mesa', capacidad: 4, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },
  { id: 'mesa-2', numero: 2, nombre: 'Mesa 2', area: 'mesa', capacidad: 4, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },
  { id: 'mesa-3', numero: 3, nombre: 'Mesa 3', area: 'mesa', capacidad: 4, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },
  { id: 'mesa-4', numero: 4, nombre: 'Mesa 4', area: 'mesa', capacidad: 6, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },
  { id: 'mesa-5', numero: 5, nombre: 'Mesa 5', area: 'mesa', capacidad: 6, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },
  { id: 'mesa-6', numero: 6, nombre: 'Mesa 6', area: 'mesa', capacidad: 4, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },
  { id: 'mesa-7', numero: 7, nombre: 'Mesa 7', area: 'mesa', capacidad: 4, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },
  { id: 'mesa-8', numero: 8, nombre: 'Mesa 8', area: 'mesa', capacidad: 8, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },
  { id: 'mesa-9', numero: 9, nombre: 'Mesa 9', area: 'mesa', capacidad: 4, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },
  { id: 'mesa-10', numero: 10, nombre: 'Mesa 10', area: 'mesa', capacidad: 4, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },
  { id: 'mesa-11', numero: 11, nombre: 'Mesa 11', area: 'mesa', capacidad: 6, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },
  { id: 'mesa-12', numero: 12, nombre: 'Mesa 12', area: 'mesa', capacidad: 8, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0, buffetsAdultos: 0, buffetsNinos: 0 },

  // --- MOSTRADOR / PARA LLEVAR ---
  { id: 'llevar-1', numero: 101, nombre: 'Para Llevar 1', area: 'domicilio', capacidad: 1, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0 },
  { id: 'llevar-2', numero: 102, nombre: 'Para Llevar 2', area: 'domicilio', capacidad: 1, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0 },
  { id: 'llevar-3', numero: 103, nombre: 'Para Llevar 3', area: 'domicilio', capacidad: 1, estado: 'libre', cuentaActivaId: null, horaApertura: null, totalParcial: 0 },
] as const;
