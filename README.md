# DCX Manager

Base administrativa para DevDesdeCeroMX, construida con React, Vite y TypeScript.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

La autenticación actual es únicamente una vista previa local. No valida ni persiste credenciales. Las variables de Supabase están documentadas en `.env.example` y permanecen vacías hasta configurar el proyecto real.

## Estructura

- `src/app`: composición global y rutas.
- `src/features`: módulos de negocio aislados por dominio.
- `src/shared`: componentes y estilos reutilizables.
