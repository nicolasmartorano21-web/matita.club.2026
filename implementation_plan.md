# Plan de Implementación: Mejoras de Seguridad, Persistencia y Base de Datos - Matita Club

Este plan detalla los pasos para mejorar la robustez de la aplicación web de Librería Matita, abordando la persistencia del carrito, la lógica de checkout, la seguridad del panel de administración y las políticas RLS en Supabase.

## User Review Required

> [!IMPORTANT]
> **Políticas RLS en Supabase:** Como no tenemos acceso directo para ejecutar comandos en tu base de datos de Supabase, proveeremos un archivo `supabase_setup.sql` en la raíz del proyecto. Deberás copiar su contenido y ejecutarlo en el editor de consultas SQL (SQL Editor) de tu consola de Supabase.

> [!NOTE]
> **Seguridad de Columnas:** Implementaremos triggers en Postgres para asegurar que los usuarios comunes no puedan alterar el precio de los productos (solo actualizar el stock de colores al comprar) ni elevar sus privilegios (como pasarse a administradores o editar sus propios puntos arbitrariamente).

## Proposed Changes

### 1. Persistencia del Carrito (Cart Persistence)

#### [MODIFY] [App.tsx](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/App.tsx)
- Inicializar el estado de `cart` desde `localStorage` al iniciar la app.
- Sincronizar el estado de `cart` con `localStorage` cada vez que sufra modificaciones.
- Asegurar que al cerrar sesión (`SIGNED_OUT`) el carrito se limpie de `localStorage` correctamente.

---

### 2. Base de Datos en Checkout y Suma de Puntos

#### [MODIFY] [Cart.tsx](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/components/Cart.tsx)
- Modificar el flujo de `handleCheckout` para calcular la suma de puntos acumulados en el carrito (`earnedPoints`).
- Actualizar los puntos del usuario de forma atómica en Supabase sumándole los puntos ganados y restándole los puntos canjeados (si corresponde), solo si el usuario es socio (`isSocio`).
- Sincronizar el estado del usuario localmente (`setUser` y `localStorage`) para que la interfaz se actualice de inmediato.

---

### 3. Seguridad del Panel de Administración

#### [MODIFY] [AdminPanel.tsx](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/components/AdminPanel.tsx)
- Remover la contraseña en texto plano `matita2026`.
- Utilizar el objeto `user` de `useApp()` para verificar si `user.isAdmin` es verdadero.
- Si el usuario no es administrador, mostrar una pantalla estilizada de "Acceso Denegado" y redirigirlo al inicio de forma segura.

---

### 4. Políticas SQL y Triggers de Seguridad (RLS)

#### [NEW] [supabase_setup.sql](file:///C:/Users/Nico/Downloads/matita.club.2026-main/matita.club.2026-main/supabase_setup.sql)
- Crear script SQL que contiene:
  1. Habilitación de RLS para las tablas `products`, `sales`, `users`, `ideas` y `site_config`.
  2. Función auxiliar `public.is_admin()` para identificar si el usuario actual es administrador sin generar recursión infinita en las políticas.
  3. Políticas RLS detalladas para lectura y escritura seguras.
  4. Triggers de protección avanzada:
     - Impedir que usuarios no administradores modifiquen precios u otros metadatos críticos de `products` (solo pueden decrementar stock en `colors`).
     - Impedir que usuarios no administradores modifiquen campos sensibles de `users` (como `is_admin`, `is_socio` o puntos ajenos).

## Verification Plan

### Automated Tests
- Validaremos que la aplicación compila correctamente después de aplicar los cambios mediante:
  `npm run build`

### Manual Verification
- **Persistencia:** Cargar productos en el carrito, recargar el navegador y verificar que el carrito se mantiene.
- **Suma de Puntos:** Simular un checkout con un usuario socio y confirmar que el total de puntos se actualiza en el header/billetera del club.
- **Seguridad en Admin:** Intentar ingresar a `/admin` con un usuario estándar o invitado y verificar que no permite el acceso, redirigiendo a la pantalla principal.
