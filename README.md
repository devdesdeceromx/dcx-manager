# DCX Manager

Base administrativa para DevDesdeCeroMX, construida con React, Vite y TypeScript.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

La autenticación usa Supabase y mantiene la sesión del usuario. Las variables necesarias están documentadas en `.env.example`; los valores locales permanecen fuera de Git mediante `.env.local`.

## Verificación

```bash
pnpm lint
pnpm build
```

La compilación separa cada módulo de negocio para descargarlo únicamente cuando el usuario lo visita.

## Preparación para producción

Antes de publicar la aplicación:

1. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en el proveedor de hosting.
2. Agrega la URL pública y `/auth/update-password` a las URLs autorizadas de Supabase Auth.
3. Actualiza la URL de regreso de la función `invite-user` al dominio definitivo.
4. Conserva `SUPABASE_SERVICE_ROLE_KEY` únicamente dentro de Supabase Edge Functions.
5. Configura el hosting para devolver `index.html` en todas las rutas de la aplicación.

## Estructura

- `src/app`: composición global y rutas.
- `src/features`: módulos de negocio aislados por dominio.
- `src/shared`: componentes y estilos reutilizables.
