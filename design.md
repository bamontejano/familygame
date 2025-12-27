# FamilyGame - Diseño de Interfaz Móvil

## Visión General
FamilyGame es una aplicación de gamificación familiar que transforma los hábitos cotidianos en un juego divertido. Los padres crean misiones (tareas), los hijos las completan y ganan monedas virtuales canjeables por recompensas.

**Orientación:** Retrato (9:16) | **Público:** Familias (padres + hijos) | **Estilo:** Desenfadado, colorido, lúdico

---

## Pantallas Principales

### 1. **Pantalla de Inicio (Home)**
**Contenido:**
- Bienvenida personalizada ("Hola, [Nombre]")
- Saldo actual de monedas virtuales (prominente, grande)
- Progreso visual del día (barra de progreso)
- Sección "Misiones Activas" con tarjetas de tareas pendientes
- Botón flotante para acceder a misiones completadas

**Funcionalidad:**
- Mostrar misiones asignadas al usuario
- Permitir marcar misiones como completadas
- Visualizar el saldo de monedas en tiempo real

---

### 2. **Pantalla de Misiones (Missions)**
**Contenido:**
- Pestaña "Disponibles" (misiones sin completar)
- Pestaña "Completadas" (historial)
- Tarjetas de misiones con:
  - Icono/categoría (limpieza, estudio, deporte, etc.)
  - Nombre de la misión
  - Descripción breve
  - Recompensa en monedas
  - Estado (pendiente/completada)
- Botón "Completar" o "Ver Detalles"

**Funcionalidad:**
- Listar misiones por estado
- Filtrar por categoría
- Marcar misiones como completadas
- Ver detalles de cada misión

---

### 3. **Pantalla de Recompensas (Rewards)**
**Contenido:**
- Catálogo de recompensas disponibles
- Tarjetas con:
  - Icono/imagen de la recompensa
  - Nombre
  - Descripción
  - Costo en monedas
  - Botón "Canjear" (activo si hay saldo suficiente)
- Sección "Mis Recompensas Canjeadas" (historial)

**Funcionalidad:**
- Mostrar recompensas disponibles
- Canjear recompensas (restar monedas)
- Ver historial de canjes
- Validar saldo antes de permitir canje

---

### 4. **Pantalla de Perfil (Profile)**
**Contenido:**
- Foto/avatar del usuario
- Nombre y rol (Padre/Hijo)
- Estadísticas:
  - Total de monedas ganadas
  - Misiones completadas
  - Recompensas canjeadas
  - Racha de días activos
- Botón de configuración
- Botón de cerrar sesión

**Funcionalidad:**
- Ver estadísticas personales
- Acceder a configuración
- Cerrar sesión

---

### 5. **Pantalla de Panel de Control (Dashboard - Solo Padres)**
**Contenido:**
- Vista de todos los hijos
- Tarjetas por hijo con:
  - Nombre
  - Monedas actuales
  - Misiones completadas hoy
  - Botón "Gestionar"
- Sección para crear nuevas misiones
- Sección para crear nuevas recompensas

**Funcionalidad:**
- Crear/editar/eliminar misiones
- Crear/editar/eliminar recompensas
- Asignar misiones a hijos
- Aprobar/rechazar misiones completadas
- Ver estadísticas de cada hijo

---

### 6. **Pantalla de Detalle de Misión (Mission Detail)**
**Contenido:**
- Nombre y descripción completa
- Categoría y icono
- Recompensa en monedas
- Fecha de vencimiento (si aplica)
- Notas adicionales
- Botón "Marcar como Completada" (hijos)
- Botón "Aprobar" / "Rechazar" (padres)

**Funcionalidad:**
- Ver detalles completos
- Marcar como completada (con confirmación)
- Aprobar/rechazar completación

---

### 7. **Pantalla de Crear/Editar Misión (Padre)**
**Contenido:**
- Campo: Nombre de la misión
- Campo: Descripción
- Selector: Categoría (Limpieza, Estudio, Deporte, Otros)
- Campo: Recompensa en monedas
- Selector: Asignar a hijo(s)
- Selector: Fecha de vencimiento (opcional)
- Botones: Guardar / Cancelar

**Funcionalidad:**
- Crear nuevas misiones
- Editar misiones existentes
- Validar campos obligatorios

---

## Flujos de Usuario Principales

### Flujo 1: Hijo Completa una Misión
1. Hijo abre la app → Home
2. Ve "Misiones Activas"
3. Toca una misión → Detalle
4. Toca "Marcar como Completada"
5. Confirmación: "¿Completaste esta tarea?"
6. Misión se marca como pendiente de aprobación
7. Notificación al padre
8. Padre aprueba → Monedas se acreditan al hijo

### Flujo 2: Padre Crea una Misión
1. Padre abre Dashboard
2. Toca "Nueva Misión"
3. Completa formulario
4. Asigna a hijo(s)
5. Guarda → Misión aparece en la app del hijo

### Flujo 3: Hijo Canjea una Recompensa
1. Hijo abre Recompensas
2. Ve catálogo
3. Toca recompensa → Detalle
4. Toca "Canjear" (si tiene saldo)
5. Confirmación: "¿Canjear por X monedas?"
6. Recompensa se agrega a "Mis Recompensas"
7. Monedas se restan del saldo

---

## Paleta de Colores (Desenfadado y Familiar)

| Elemento | Color | Uso |
|----------|-------|-----|
| **Primario** | #6366F1 (Índigo) | Botones principales, acentos |
| **Secundario** | #EC4899 (Rosa) | Elementos secundarios, destacados |
| **Éxito** | #10B981 (Verde) | Misiones completadas, confirmaciones |
| **Advertencia** | #F59E0B (Ámbar) | Pendiente de aprobación |
| **Error** | #EF4444 (Rojo) | Errores, rechazos |
| **Fondo** | #FFFFFF (Blanco) | Fondo principal |
| **Superficie** | #F3F4F6 (Gris claro) | Tarjetas, contenedores |
| **Texto Primario** | #1F2937 (Gris oscuro) | Texto principal |
| **Texto Secundario** | #6B7280 (Gris medio) | Texto secundario |
| **Monedas** | #FBBF24 (Amarillo) | Icono de monedas |

---

## Componentes Reutilizables

- **MissionCard:** Tarjeta de misión con icono, nombre, recompensa
- **RewardCard:** Tarjeta de recompensa con icono, nombre, costo
- **CoinDisplay:** Mostrador de monedas (saldo actual)
- **Button:** Botón primario/secundario
- **TabBar:** Navegación inferior con pestañas
- **Modal:** Confirmaciones y diálogos
- **ProgressBar:** Barra de progreso diaria
- **Avatar:** Avatar del usuario

---

## Consideraciones de Diseño

1. **Accesibilidad:** Texto legible, colores con suficiente contraste
2. **Responsividad:** Adaptarse a diferentes tamaños de pantalla
3. **Interactividad:** Feedback visual en cada acción (presión, animaciones suaves)
4. **Gamificación:** Celebraciones visuales al completar misiones o canjear recompensas
5. **Seguridad:** Confirmaciones antes de acciones irreversibles (canje de recompensas)
6. **Rendimiento:** Carga rápida de misiones y recompensas
