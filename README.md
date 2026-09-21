# DCX Manager

Base administrativa para DevDesdeCeroMX, construida con React, Vite y TypeScript.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

La autenticación usa Supabase y mantiene la sesión del usuario. Las variables necesarias están documentadas en `.env.example`; los valores locales permanecen fuera de Git mediante `.env.local`.

## Estructura

- `src/app`: composición global y rutas.
- `src/features`: módulos de negocio aislados por dominio.
- `src/shared`: componentes y estilos reutilizables.
