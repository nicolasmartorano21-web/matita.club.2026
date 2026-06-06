# Plan de Implementación: Interactividad y Gamificación en Matita Club

Este plan propone añadir interactividad y gamificación al proyecto de Matita, elevando la experiencia del usuario con notificaciones visuales premium, confetti festivo y un minijuego de "Ruleta de la Suerte" diaria para sumar puntos del club.

## User Review Required

> [!TIP]
> **Toasts en reemplazo de Alerts:** Reemplazaremos los `alert()` nativos del navegador por un sistema de notificaciones flotantes (Toasts) personalizadas que no detienen la ejecución del usuario y se adaptan a la paleta de colores del club.

> [!NOTE]
> **Base de Datos para la Ruleta:** Agregaremos el campo `last_spin_at` a la tabla `users` en el script SQL para controlar que cada socio solo pueda girar la ruleta una vez al día.

## Proposed Changes

### 1. Sistema de Toasts Personalizados (Toast Notifications)

#### [MODIFY] [App.tsx](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/App.tsx)
- Añadir el estado `toasts` y una función `showToast(title, description, type)` al contexto global de la aplicación (`AppContext`).
- Renderizar un contenedor de toasts flotantes en la esquina superior derecha con animaciones de entrada/salida y un temporizador.

#### [MODIFY] Reemplazo de `alert()` por `showToast()`
Modificar los siguientes componentes para usar `showToast`:
- [LoginScreen.tsx](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/components/LoginScreen.tsx)
- [ProductCard.tsx](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/components/ProductCard.tsx)
- [Cart.tsx](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/components/Cart.tsx)
- [ClubView.tsx](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/components/ClubView.tsx)
- [AdminPanel.tsx](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/components/AdminPanel.tsx)

---

### 2. Animación de Confeti Festivo (Brand Confetti)

#### [NEW] [utils/confetti.ts](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/utils/confetti.ts)
- Implementar un generador de confeti en lienzo canvas nativo sin dependencias externas.
- Utilizar los colores temáticos de Matita (`#f6a118`, `#ea7e9c`, `#fadb31`, `#93c5fd`, `#86efac`).
- Exportar una función `triggerConfetti()` que arroje confeti en pantalla.
- Disparar confeti al:
  1. Confirmar una reserva en `Cart.tsx`.
  2. Ganar puntos en la ruleta en `ClubView.tsx`.

---

### 3. Ruleta de la Suerte Diaria (Daily Lucky Wheel)

#### [MODIFY] [ClubView.tsx](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/components/ClubView.tsx)
- Diseñar una ruleta gráfica interactiva en formato SVG con 6 segmentos.
- El usuario socio puede hacer clic en "Girar Ruleta 🎡" una vez al día.
- El resultado se calcula aleatoriamente en el cliente (p. ej. ganando 10, 20 o 50 puntos) y se actualiza en Supabase y localmente.
- Se valida la fecha del último giro usando el campo `last_spin_at` proveniente de la DB para evitar abusos.

#### [MODIFY] [supabase_setup.sql](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/supabase_setup.sql)
- Añadir la columna `last_spin_at` a la tabla `users`.
- Actualizar el trigger de seguridad `check_user_update` para permitir que el usuario actualice su propia columna `last_spin_at`.

---

### 4. Animación de Feedback en Carrito

#### [MODIFY] [Cart.tsx](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/components/Cart.tsx)
- Añadir un efecto de agitación/animación (wiggle/bounce) temporal en el botón flotante del carrito cada vez que se agregue un producto al carrito.

## Verification Plan

### Automated Tests
- Ejecutaremos `npm run build` para asegurar que todo compila perfectamente.

### Manual Verification
- **Toasts:** Realizar acciones (como agregar un producto o fallar al ingresar un campo) y verificar que las notificaciones flotantes aparecen y desaparecen con fluidez.
- **Ruleta de la Suerte:** Entrar a la sección Club, presionar girar, ver la animación de rotación física de la ruleta, el confeti al detenerse y el incremento inmediato de puntos. Intentar girar nuevamente y comprobar que el botón está bloqueado y muestra "Vuelve mañana".
- **Confeti de Checkout:** Confirmar un pedido en el carrito y validar la lluvia de confeti en toda la pantalla.
