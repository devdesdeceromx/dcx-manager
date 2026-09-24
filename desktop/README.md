# DevDesdeCeroMx Timer

Widget flotante de Windows conectado al mismo Supabase de DevDesdeCeroMx Manager.

## Funciones

- Inicio de sesión con la cuenta del Manager.
- Selección de proyecto y tarea.
- Inicio, pausa, reanudación y finalización sincronizados.
- Modo compacto y ventana siempre visible.
- Minimización a la bandeja de Windows.
- Sesión persistente protegida por Supabase Auth.

## Desarrollo

Desde la raíz del repositorio:

```bash
pnpm desktop:dev
pnpm desktop:build
pnpm desktop:dist
```

El instalador se genera en `desktop/release`. Los archivos de configuración de Supabase se leen desde el `.env.local` de la raíz y nunca deben contener una clave `service_role`.
