# FamilyGame - Project TODO

## Phase 1: Design & Architecture
- [x] Create design.md with screen layouts and user flows
- [x] Design database schema (users, missions, rewards, coins)
- [x] Plan API endpoints and data structures

## Phase 2: Backend Setup
- [x] Create database tables (users, missions, rewards, transactions)
- [x] Implement user authentication (parent/child roles)
- [x] Create API endpoints for missions CRUD
- [x] Create API endpoints for rewards CRUD
- [x] Create API endpoints for coin transactions
- [x] Implement mission approval workflow

## Phase 3: Frontend - Core Navigation
- [x] Set up tab navigation (Home, Missions, Rewards, Profile)
- [x] Create ScreenContainer wrapper for all screens
- [x] Implement theme colors (indigo, pink, green palette)
- [x] Create reusable UI components (MissionCard, RewardCard, CoinDisplay)

## Phase 4: Frontend - Home Screen
- [x] Display user greeting and current coin balance
- [x] Show active missions list
- [x] Implement daily progress bar
- [x] Add button to view completed missions

## Phase 5: Frontend - Missions Screen
- [x] Display available missions in list/card format
- [x] Add "Completed" tab for mission history
- [ ] Implement mission detail view
- [ ] Add "Mark as Completed" button for children
- [ ] Add approval workflow for parents

## Phase 6: Frontend - Rewards Screen
- [x] Display reward catalog with cards
- [x] Show reward details (name, description, cost)
- [x] Implement "Redeem" button with coin validation
- [x] Show "My Rewards" section (redeemed items)
- [x] Add confirmation modal before redeeming

## Phase 7: Frontend - Profile Screen
- [x] Display user avatar and name
- [x] Show user statistics (coins earned, missions completed, rewards redeemed)
- [ ] Add settings button
- [x] Implement logout functionality

## Phase 8: Frontend - Parent Dashboard (if needed)
- [ ] Create parent-only dashboard view
- [ ] Display all children with their stats
- [ ] Implement "Create Mission" form
- [ ] Implement "Create Reward" form
- [ ] Add mission/reward management interface

## Phase 9: Gamification Features
- [ ] Add coin animation when mission is completed
- [ ] Implement celebration animation on reward redemption
- [ ] Add daily streak tracking
- [ ] Create achievement/badge system (optional)

## Phase 10: Testing & Polish
- [ ] Test all user flows end-to-end
- [ ] Verify coin calculations and transactions
- [ ] Test parent/child role separation
- [ ] Check responsive design on different screen sizes
- [ ] Fix bugs and optimize performance

## Phase 11: Branding
- [x] Generate custom app logo
- [x] Update app.config.ts with branding
- [x] Create splash screen
- [x] Set up app icons for iOS/Android

## Phase 12: Deployment & Documentation
- [ ] Create project checkpoint
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Prepare for deployment


## Adaptación de Diseños Proporcionados

### Pantalla de Bienvenida (FamilyCoin)
- [x] Crear carrusel de onboarding con 3 slides
- [x] Implementar slide 1: "Convierte los deberes en diversión"
- [x] Implementar slide 2: "Completa Misiones"
- [x] Implementar slide 3: "Gana Monedas"
- [x] Agregar botón "Empezar Aventura" con animación
- [x] Agregar enlace "Ya tienes familia? Inicia sesión"

### Dashboard del Hijo
- [x] Mostrar avatar y nombre del hijo con saludo personalizado
- [x] Mostrar saldo de monedas con icono
- [x] Implementar barra de progreso de nivel
- [x] Mostrar misiones de hoy con contador
- [x] Agregar botón "Listo!" para marcar misión completada
- [x] Mostrar sección "Premios Cercanos"
- [x] Implementar navegación inferior con iconos

### Dashboard del Padre
- [x] Mostrar nombre de familia y saludo personalizado
- [x] Mostrar tarjetas de hijos con saldo y nivel
- [x] Agregar botón "Crear Misión"
- [x] Agregar botón "Dar Recompensa"
- [x] Mostrar "Misiones por Aprobar" con botones de aceptar/rechazar
- [x] Implementar navegación inferior con iconos

### Pantalla de Lista de Recompensas
- [x] Mostrar saldo total en la parte superior
- [x] Implementar filtros (Todos, Comida, Diversión, etc.)
- [x] Mostrar recompensas disponibles en grid
- [x] Agregar botón "Nueva Recompensa" (solo padres)
- [x] Implementar modal de confirmación de canje

### Pantalla de Canjear Recompensa
- [x] Mostrar saldo actual
- [x] Implementar filtros de categoría
- [x] Mostrar grid de recompensas con imágenes
- [x] Agregar botón "Canjear" en cada recompensa
- [x] Implementar modal de confirmación
- [x] Mostrar mensaje de éxito tras canje

### Pantalla de Crear Nueva Misión
- [x] Campo de entrada para descripción de misión
- [x] Campo de detalles opcionales
- [x] Selector de frecuencia (Diaria, Semanal, Única)
- [x] Selector de hijo/héroe
- [x] Slider para seleccionar recompensa en monedas
- [x] Botón "Lanzar Misión"

### Cambios de Diseño General
- [x] Actualizar paleta de colores a verde brillante (#00FF00 o similar)
- [x] Cambiar nombre de app a "FamilyCoin" (si aplica)
- [x] Implementar iconografía consistente
- [ ] Agregar animaciones de celebración
- [x] Mejorar feedback visual en botones


## Sistema de Autenticación

- [x] Crear pantalla de Sign In con email y contraseña
- [x] Crear pantalla de Sign Up con formulario de registro
- [x] Implementar selector de rol (Padre/Hijo) en Sign Up
- [x] Agregar validación de formularios
- [ ] Implementar recuperación de contraseña
- [x] Agregar link de Sign In en pantalla de bienvenida
- [x] Agregar link de Sign Up en pantalla de Sign In
- [x] Integrar con API de autenticación existente
- [x] Guardar token de sesión en AsyncStorage
- [x] Implementar logout en perfil


## Sistema de Códigos de Invitación

- [x] Agregar tabla de códigos de invitación en base de datos
- [x] Generar código único cuando padre crea cuenta
- [x] Crear pantalla de ingreso de código para hijos
- [x] Implementar validación de código en backend
- [x] Vincular automáticamente padre-hijo al usar código
- [x] Mostrar código de invitación en perfil del padre
- [x] Permitir regenerar código si es necesario
- [x] Agregar historial de invitaciones usadas
- [x] Validar que código no esté expirado
- [ ] Mostrar familia vinculada en dashboard
