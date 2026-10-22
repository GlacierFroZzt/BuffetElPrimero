# Bitácora Técnica y Memoria Continua - Buffet El Primero

## 1. Decisiones Arquitectónicas del Proyecto
- **Base del Proyecto:** Clonación y adaptación integral de la plataforma *La Estación Grill* (React 19 + TypeScript en modo estricto `strict: true` + Vite + Tailwind CSS + Lucide Icons + Supabase Realtime / WebSocket local / Offline First).
- **Identidad de Marca y Estilo Visual:**
  - Nombre comercial: **Buffet El Primero**.
  - Paleta cromática principal: **Blanco y Azul** (sustituyendo el esquema oscuro/carbón/óxido de taquería por un diseño limpio, fresco, profesional y luminoso con contrastes en azul marino `#1e40af`, azul zafiro `#2563eb`, azul cielo suave `#dbeafe` y fondos blancos/neutros limpios `#ffffff`, `#f8fafc`).
- **Modelo de Negocio (Buffet + Extras para Llevar + Avisos de Barra):**
  - **Buffet Base:** Conteo rápido y optimizado de Buffets Adultos, Buffets Niños y Bebidas/Refrescos por mesa o ticket.
  - **Extras / Para Llevar:** Venta ágil de kilos y medios kilos de pollo asado, barbacoa por kilo, órdenes de tacos y guarniciones para llevar o para consumo en mesa.
  - **Sistema de Avisos de Resurtido de Barra:** Módulo ágil de alertas a cocina para reportar en tiempo real platillos y guisos que están bajos o agotados en la barra del buffet (ej. arroz, frijoles, guisados, tortillas, pollo asado en barra) con niveles de urgencia y confirmación de resurtido.
- **Módulo de Control de Inventario:**
  - Control de existencias para bebidas/refrescos (conteo unitario con descuento automático por comanda y alertas de stock mínimo).
  - Control de existencias para ingredientes y materias primas (kilos de pollo, carne para barbacoa, tortillas, etc.), con registro de entradas, salidas y mermas.
- **Reglas del Proyecto:**
  - Gestor de paquetes: Estrictamente `pnpm`.
  - Tipado: TypeScript estricto sin `any`.
  - Idioma: Español integral en código, interfaces y comentarios.

## 2. Errores Detectados y Correcciones Aplicadas
1. **Firma de `archivarTurnoYCerrar` en `RepositorioStorage`:**
   - *Error:* Al actualizar el almacenamiento para inventario, el 4to parámetro de `archivarTurnoYCerrar` pasó a ser `movimientosInventario?: MovimientoInventario[]`, mientras que `RestauranteContext.tsx` continuaba pasando `pedidosCocina`.
   - *Solución:* Se ajustó la llamada en `reiniciarTurnoActual` para suministrar `movimientosInventario`, preservando la auditoría de consumos de bodega en cada corte de caja.
2. **Tipos en `TourGuiadoFlotante.tsx` y `tutorial.ts`:**
   - *Error:* `vistaInicial` y `onCambiarVistaRef` estaban estrictamente tipados como `'mesas' | 'cocina'`, lo que impedía navegar a las nuevas vistas de buffet (`'inventario'` y `'avisos_barra'`).
   - *Solución:* Se extendió la interfaz `PasoTutorial` y los estados locales de `TourGuiadoFlotante` para utilizar el tipo unificado `VistaPrincipal = 'mesas' | 'inventario' | 'avisos_barra' | 'cocina'`.
3. **Variables no leídas tras desacoplamiento de KDS:**
   - *Error:* `NavbarSuperior.tsx` desestructuraba `pedidosCocina` sin utilizarla tras la sustitución del botón KDS por los accesos directos de Inventario y Avisos de Barra.
   - *Solución:* Se removió la propiedad no utilizada para cumplir con `noUnusedLocals` y `strict: true`.
4. **Crash del APK al abrir ("La aplicación Buffet El Primero dejó de funcionar"):**
   - *Error:* Al cambiar el `namespace` a `com.buffetelprimero.app` en `app/build.gradle.kts`, Android intentaba lanzar en el manifest `.MainActivity` (es decir `com.buffetelprimero.app.MainActivity`). Sin embargo, el archivo fuente `MainActivity.kt` permanecía en el paquete `com.laestacion.grill`, generando un `ClassNotFoundException` en runtime que provocaba que la app crasheara inmediatamente al abrir.
   - *Solución:* Se migró `MainActivity.kt` a `app/src/main/java/com/buffetelprimero/app/MainActivity.kt`, se cambió la declaración de paquete a `package com.buffetelprimero.app`, se ajustó el CANAL_ID y nombres de notificaciones a Buffet El Primero, y se unificó el estilo en `Theme.BuffetElPrimero`. El APK v1.0.1 abre con total estabilidad y rapidez.
5. **Menú de Hamburguesa Inaccesible en Celulares Estrechos:**
   - *Error:* El contenedor central de navegación tenía ancho rígido sin scroll horizontal, lo que en pantallas de 360-390px empujaba el botón de menú hamburguesa ☰ fuera del viewport derecho debido al `overflow-hidden` del header.
   - *Solución:* Se aisló el bloque de la derecha con `shrink-0 z-20` y botón hamburguesa fijo de alta visibilidad táctil (`bg-blue-50 border-blue-200 text-blue-700 min-w-[36px]`). El conmutador central se adaptó con `overflow-x-auto no-scrollbar` para no desplazar elementos críticos.
6. **Falta de Scroll y Bloqueo en Vista de Barra:**
   - *Error:* En pantallas móviles, las dos columnas (envío de avisos y monitor de barra) estaban apiladas verticalmente dentro de un contenedor con `overflow-hidden` y la primera columna con `shrink-0`, dejando la segunda columna inaccesible e impidiendo el scroll hacia abajo.
   - *Solución:* Se implementó un selector de pestañas móvil ("Reportar Platillo" y "Estado Barra") con `overflow-y-auto pb-28`, manteniendo en tablets/desktop la vista simultánea en dos columnas con scroll vertical fluido independiente.
7. **Separación de Barra y Cocina:**
   - *Solución:* Se separaron explícitamente en el conmutador y en `App.tsx`:
     - **Barra (`/barra`):** Panel para meseros/piso para reportar charolas de buffet vacías o bajas en 1 toque.
     - **Cocina (`/cocina`):** Monitor KDS para personal de preparación de asador (kilos de pollo, barbacoa, tacos) y resurtidos urgentes de barra solicitados con botón de confirmación.

## 3. Estado de la Suite y Módulos Activos
- **Servidor Local Activo:** Vite corriendo en `http://localhost:5173/` (y en red local).
- **Compilación Android (APK):** Generado exitosamente en `d:\BuffetElPrimero\BuffetElPrimero-v1.0.1.apk` (y `BuffetElPrimero.apk`) con namespace `com.buffetelprimero.app` e identidad Buffet El Primero.
- **Despliegue OTA en Supabase:** Paquete `web-bundle.zip` y `version.json` (v1.0.1) subidos y activos en el bucket público de Supabase.
- **Repositorio Remoto en GitHub:** Repositorio público sincronizado y publicado en `https://github.com/GlacierFroZzt/BuffetElPrimero`.
- **Compilación Web:** `tsc -b && vite build` compila al 100% con código 0 y empaquetado optimizado con `pnpm`.
- **Branding:** Blanco y azul (`bg-slate-50`, `bg-blue-600`, `text-blue-900`) en toda la interfaz.
- **Flujo de Buffet:**
  - Apertura de mesa con diálogo directo de comensales (Adultos $180, Niños $95).
  - Panel superior en Comandero para ajustar (+/-) adultos y niños en cualquier momento.
  - Venta de refrescos con visualización de existencias en tiempo real y descuento automático al cobrar.
  - Venta de extras para llevar: Kilos y medios kilos de pollo asado, barbacoa por kilo y tacos.
  - Avisos de Barra a Cocina con niveles de urgencia (Crítico, Urgente, Preventivo) y confirmación de resurtido.
  - Control de Inventario completo con historial de movimientos, registro de compras y mermas.
  - Corte de Caja con totalización de comensales (adultos y niños) y refrescos del turno.
