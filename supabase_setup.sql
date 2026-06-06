-- =====================================================================
-- SCRIPT DE SEGURIDAD Y CONFIGURACIÓN RLS PARA SUPABASE (MATITA CLUB)
-- =====================================================================
-- Copia y ejecuta este script completo en el SQL Editor de tu consola de Supabase.
-- =====================================================================

-- 1. HABILITAR LA EXTENSIÓN UUID (si no está habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ASEGURAR QUE LAS TABLAS EXISTAN CON LA ESTRUCTURA CORRECTA
-- Nota: Si tus tablas ya existen, estas sentencias no alterarán los datos existentes.

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    points INTEGER DEFAULT 50,
    is_socio BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    last_spin_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar que la columna existe si la tabla ya había sido creada anteriormente
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_spin_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    old_price NUMERIC DEFAULT 0,
    points INTEGER DEFAULT 0,
    category TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    colors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total NUMERIC NOT NULL DEFAULT 0,
    user_name TEXT NOT NULL,
    category_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_config (
    id TEXT PRIMARY KEY DEFAULT 'global',
    logo_url TEXT,
    carousel_images TEXT[] DEFAULT '{}'
);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- 4. FUNCIÓN AUXILIAR DE SEGURIDAD PARA CHEQUEAR ADMINS
-- Usamos SECURITY DEFINER para ejecutar esta consulta con privilegios de sistema,
-- previniendo la recursión infinita en las políticas de la tabla 'users'.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. POLÍTICAS PARA LA TABLA: users (Perfiles de usuario)
DROP POLICY IF EXISTS "Permitir lectura de perfil propio y admins" ON public.users;
CREATE POLICY "Permitir lectura de perfil propio y admins" ON public.users
    FOR SELECT TO public
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Permitir registro de nuevos usuarios" ON public.users;
CREATE POLICY "Permitir registro de nuevos usuarios" ON public.users
    FOR INSERT TO public
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Permitir actualizaciones de perfil propio y admins" ON public.users;
CREATE POLICY "Permitir actualizaciones de perfil propio y admins" ON public.users
    FOR UPDATE TO public
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Permitir eliminación a administradores" ON public.users;
CREATE POLICY "Permitir eliminación a administradores" ON public.users
    FOR DELETE TO public
    USING (public.is_admin());

-- 6. POLÍTICAS PARA LA TABLA: products (Catálogo)
DROP POLICY IF EXISTS "Lectura pública de productos" ON public.products;
CREATE POLICY "Lectura pública de productos" ON public.products
    FOR SELECT TO public
    USING (TRUE);

DROP POLICY IF EXISTS "Actualización de stock y admins" ON public.products;
CREATE POLICY "Actualización de stock y admins" ON public.products
    FOR UPDATE TO public
    USING (TRUE)
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Escritura completa restringida a admins" ON public.products;
CREATE POLICY "Escritura completa restringida a admins" ON public.products
    FOR ALL TO public
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 7. POLÍTICAS PARA LA TABLA: sales (Ventas)
DROP POLICY IF EXISTS "Lectura de ventas solo admins" ON public.sales;
CREATE POLICY "Lectura de ventas solo admins" ON public.sales
    FOR SELECT TO public
    USING (public.is_admin());

DROP POLICY IF EXISTS "Cualquiera puede registrar una venta" ON public.sales;
CREATE POLICY "Cualquiera puede registrar una venta" ON public.sales
    FOR INSERT TO public
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Modificación/Eliminación de ventas solo admins" ON public.sales;
CREATE POLICY "Modificación/Eliminación de ventas solo admins" ON public.sales
    FOR ALL TO public
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 8. POLÍTICAS PARA LA TABLA: ideas (Buzón de sugerencias)
DROP POLICY IF EXISTS "Cualquiera puede leer ideas" ON public.ideas;
CREATE POLICY "Cualquiera puede leer ideas" ON public.ideas
    FOR SELECT TO public
    USING (TRUE);

DROP POLICY IF EXISTS "Cualquiera puede insertar ideas" ON public.ideas;
CREATE POLICY "Cualquiera puede insertar ideas" ON public.ideas
    FOR INSERT TO public
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Edición y eliminación de ideas solo admins" ON public.ideas;
CREATE POLICY "Edición y eliminación de ideas solo admins" ON public.ideas
    FOR ALL TO public
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 9. POLÍTICAS PARA LA TABLA: site_config (Logotipo y Banner)
DROP POLICY IF EXISTS "Lectura pública de configuración" ON public.site_config;
CREATE POLICY "Lectura pública de configuración" ON public.site_config
    FOR SELECT TO public
    USING (TRUE);

DROP POLICY IF EXISTS "Modificación de configuración solo admins" ON public.site_config;
CREATE POLICY "Modificación de configuración solo admins" ON public.site_config
    FOR ALL TO public
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =====================================================================
-- TRIGGERS DE SEGURIDAD (PROTECCIÓN CONTRA EDICIÓN DIRECTA DESDE CONSOLA)
-- =====================================================================

-- A. TRIGGER DE SEGURIDAD PARA LA TABLA: products
-- Asegura que usuarios no admins solo puedan alterar el stock (columna 'colors')
CREATE OR REPLACE FUNCTION public.check_product_update()
RETURNS TRIGGER AS $$
BEGIN
    IF public.is_admin() THEN
        RETURN NEW;
    END IF;
    
    -- Si no es administrador, verifica que no se alteren campos críticos
    IF (OLD.name IS DISTINCT FROM NEW.name OR
        OLD.description IS DISTINCT FROM NEW.description OR
        OLD.price IS DISTINCT FROM NEW.price OR
        OLD.old_price IS DISTINCT FROM NEW.old_price OR
        OLD.points IS DISTINCT FROM NEW.points OR
        OLD.category IS DISTINCT FROM NEW.category OR
        OLD.images IS DISTINCT FROM NEW.images) THEN
        RAISE EXCEPTION 'Acceso denegado: No tenés permisos para modificar estos campos del producto 🛡️';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_product_update_fields ON public.products;
CREATE TRIGGER enforce_product_update_fields
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.check_product_update();

-- B. TRIGGER DE SEGURIDAD PARA LA TABLA: users
-- Asegura que usuarios no admins solo puedan modificar su propio nombre y puntos de forma legítima,
-- e impide elevar privilegios (is_admin, is_socio, etc.).
CREATE OR REPLACE FUNCTION public.check_user_update()
RETURNS TRIGGER AS $$
BEGIN
    IF public.is_admin() THEN
        RETURN NEW;
    END IF;

    -- Los usuarios normales solo pueden modificar su propio ID
    IF auth.uid() <> NEW.id THEN
        RAISE EXCEPTION 'Acceso denegado: No podés modificar perfiles ajenos 🛡️';
    END IF;

    -- Impedir modificación de is_admin, is_socio o email por el usuario
    IF (OLD.is_admin IS DISTINCT FROM NEW.is_admin OR
        OLD.is_socio IS DISTINCT FROM NEW.is_socio OR
        OLD.email IS DISTINCT FROM NEW.email) THEN
        RAISE EXCEPTION 'Acceso denegado: No tenés permisos para cambiar la configuración de tu cuenta o privilegios 🛡️';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_user_update_fields ON public.users;
CREATE TRIGGER enforce_user_update_fields
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.check_user_update();
