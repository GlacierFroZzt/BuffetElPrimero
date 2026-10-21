import type { CategoriaProducto, Producto } from '../types';

/**
 * Modificadores rápidos contextuales por categoría en Buffet El Primero.
 */
export const MODIFICADORES_POR_CATEGORIA: Record<CategoriaProducto, readonly string[]> = {
  buffet: [
    'Mesa completa',
    'Incluye postre',
    'Silla para bebé',
    'Comensal extra',
  ],
  refrescos: [
    'Bien fría',
    'Con vaso con hielo',
    'Sin hielo',
    'Poco hielo',
    'Con popote',
    'Con limón y sal',
  ],
  asador_extras: [
    'Para llevar',
    'Bien doradito',
    'Con salsa verde aparte',
    'Con salsa roja aparte',
    'Tortillas de maíz',
    'Tortillas de harina',
    'Cebolla asada extra',
    'Limones y chiles toreados',
  ],
  guarniciones: [
    'Para llevar',
    'Bien caliente',
    'Sin picante',
    'Porción doble',
  ],
  bebidas: [
    'Bien fría',
    'Con vaso con hielo',
    'Sin hielo',
  ],
  tacos: [
    'Con todo (cebolla y cilantro)',
    'Sin verdura',
    'Salsa aparte',
  ],
  extras: [
    'Para llevar',
    'Bien caliente',
  ],
} as const;

export const MODIFICADORES_RAPIDOS: readonly string[] = MODIFICADORES_POR_CATEGORIA.asador_extras;

/**
 * Catálogo inicial de productos para BUFFET EL PRIMERO.
 */
export const PRODUCTOS_INICIALES: readonly Producto[] = [
  // ==========================================
  // 1. BUFFET (CONSUMO ILIMITADO EN MESA)
  // ==========================================
  {
    id: 'prod-buffet-adulto',
    nombre: 'Buffet Adulto',
    descripcion: 'Acceso ilimitado a toda la barra de guisados, asador, arroz, frijoles charros, ensaladas y postres.',
    precio: 180,
    categoria: 'buffet',
    requierePreparacion: false,
  },
  {
    id: 'prod-buffet-nino',
    nombre: 'Buffet Niño',
    descripcion: 'Tarifa especial para menores de 10 años. Acceso ilimitado a barra de buffet.',
    precio: 95,
    categoria: 'buffet',
    requierePreparacion: false,
  },

  // ==========================================
  // 2. REFRESCOS Y BEBIDAS
  // ==========================================
  {
    id: 'prod-refresco-coca',
    nombre: 'Coca-Cola 600ml',
    descripcion: 'Botella original fría de 600ml.',
    precio: 35,
    categoria: 'refrescos',
    requierePreparacion: false,
    itemInventarioId: 'inv-refresco-coca',
  },
  {
    id: 'prod-refresco-coca-light',
    nombre: 'Coca-Cola Sin Azúcar 600ml',
    descripcion: 'Refresco frío sin calorías de 600ml.',
    precio: 35,
    categoria: 'refrescos',
    requierePreparacion: false,
    itemInventarioId: 'inv-refresco-coca-light',
  },
  {
    id: 'prod-refresco-joya-manzana',
    nombre: 'Joya Manzana 600ml',
    descripcion: 'Sabor tradicional regiomontano de 600ml.',
    precio: 35,
    categoria: 'refrescos',
    requierePreparacion: false,
    itemInventarioId: 'inv-refresco-joya-manzana',
  },
  {
    id: 'prod-refresco-joya-ponche',
    nombre: 'Joya Ponche 600ml',
    descripcion: 'Refresco sabor ponche de frutas 600ml.',
    precio: 35,
    categoria: 'refrescos',
    requierePreparacion: false,
    itemInventarioId: 'inv-refresco-joya-ponche',
  },
  {
    id: 'prod-refresco-sprite',
    nombre: 'Sprite 600ml',
    descripcion: 'Refresco lima-limón bien frío 600ml.',
    precio: 35,
    categoria: 'refrescos',
    requierePreparacion: false,
    itemInventarioId: 'inv-refresco-sprite',
  },
  {
    id: 'prod-refresco-fanta',
    nombre: 'Fanta Naranja 600ml',
    descripcion: 'Refresco sabor naranja bien frío 600ml.',
    precio: 35,
    categoria: 'refrescos',
    requierePreparacion: false,
    itemInventarioId: 'inv-refresco-fanta',
  },
  {
    id: 'prod-bebida-agua-natural',
    nombre: 'Agua Purificada 600ml',
    descripcion: 'Botella de agua purificada natural.',
    precio: 25,
    categoria: 'refrescos',
    requierePreparacion: false,
    itemInventarioId: 'inv-bebida-agua-natural',
  },
  {
    id: 'prod-bebida-horchata-1l',
    nombre: 'Agua de Horchata 1 Litro',
    descripcion: 'Agua fresca artesanal de horchata con canela.',
    precio: 45,
    categoria: 'refrescos',
    requierePreparacion: false,
  },
  {
    id: 'prod-bebida-jamaica-1l',
    nombre: 'Agua de Jamaica 1 Litro',
    descripcion: 'Agua fresca artesanal de flor de jamaica.',
    precio: 45,
    categoria: 'refrescos',
    requierePreparacion: false,
  },

  // ==========================================
  // 3. EXTRAS ASADOR Y PARA LLEVAR
  // ==========================================
  {
    id: 'prod-asador-pollo-entero',
    nombre: 'Pollo Asado Entero (1 Kg aprox.)',
    descripcion: 'Pollo asado al carbón marinado estilo norteño. Acompañado de cebolla asada, salsa y tortillas.',
    precio: 180,
    categoria: 'asador_extras',
    requierePreparacion: true,
  },
  {
    id: 'prod-asador-medio-pollo',
    nombre: 'Medio Pollo Asado (1/2 Kg aprox.)',
    descripcion: 'Medio pollo al carbón con salsa, cebolla y tortillas.',
    precio: 95,
    categoria: 'asador_extras',
    requierePreparacion: true,
  },
  {
    id: 'prod-asador-barbacoa-kilo',
    nombre: 'Barbacoa de Res (1 Kilo)',
    descripcion: 'Kilo de barbacoa tradicional suave y jugosa, incluye tortillas, salsas, cilantro y cebolla.',
    precio: 380,
    categoria: 'asador_extras',
    requierePreparacion: true,
  },
  {
    id: 'prod-asador-barbacoa-medio-kilo',
    nombre: 'Barbacoa de Res (Medio Kilo)',
    descripcion: 'Medio kilo de barbacoa de res suavecita con guarnición de salsas y tortillas.',
    precio: 195,
    categoria: 'asador_extras',
    requierePreparacion: true,
  },
  {
    id: 'prod-asador-orden-tacos-barbacoa',
    nombre: 'Orden de Tacos de Barbacoa (5 pzas)',
    descripcion: 'Cinco tacos en tortilla de maíz o harina con cebolla y cilantro.',
    precio: 120,
    categoria: 'asador_extras',
    requierePreparacion: true,
  },
  {
    id: 'prod-asador-taco-barbacoa',
    nombre: 'Taco Individual de Barbacoa',
    descripcion: 'Taco individual bien servido de barbacoa.',
    precio: 25,
    categoria: 'asador_extras',
    requierePreparacion: true,
  },
  {
    id: 'prod-asador-taco-asador',
    nombre: 'Taco Individual de Pollo Asado',
    descripcion: 'Taco de pollo asado deshebrado con cebolla y salsa.',
    precio: 25,
    categoria: 'asador_extras',
    requierePreparacion: true,
  },

  // ==========================================
  // 4. GUARNICIONES Y COMPLEMENTOS
  // ==========================================
  {
    id: 'prod-guarnicion-frijoles-charros',
    nombre: 'Frijoles Charros Especiales',
    descripcion: 'Orden de frijoles charros con tocino, salchicha y cilantro.',
    precio: 45,
    categoria: 'guarniciones',
    requierePreparacion: false,
  },
  {
    id: 'prod-guarnicion-arroz',
    nombre: 'Arroz Rojo Especial (Orden)',
    descripcion: 'Porción generosa de arroz casero a la mexicana.',
    precio: 35,
    categoria: 'guarniciones',
    requierePreparacion: false,
  },
  {
    id: 'prod-guarnicion-tortillas-maiz',
    nombre: 'Paquete de Tortillas de Maíz Extra',
    descripcion: 'Medio kilo de tortillas calientes.',
    precio: 20,
    categoria: 'guarniciones',
    requierePreparacion: false,
  },
  {
    id: 'prod-guarnicion-tortillas-harina',
    nombre: 'Paquete de Tortillas de Harina Extra',
    descripcion: 'Paquete de 10 piezas de tortillas de harina norteñas.',
    precio: 25,
    categoria: 'guarniciones',
    requierePreparacion: false,
  },
  {
    id: 'prod-guarnicion-salsa-extra',
    nombre: 'Salsa Casera Extra (250 ml)',
    descripcion: 'Frasco de salsa verde o roja recién hecha.',
    precio: 25,
    categoria: 'guarniciones',
    requierePreparacion: false,
  },
];
