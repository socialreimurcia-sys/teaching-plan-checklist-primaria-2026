# Teaching Plan Checklist Primaria 2026

## Stack
- HTML estático (`fustersaura_primary_checklist.html`)
- Logo: `logo fustersaura sin fondo.png`
- Deploy: Netlify (sitio estático)
- API: Anthropic (proxy via Netlify Function)

## MCPs disponibles
- GitHub MCP: repositorio en org `socialreimurcia-sys`
- Netlify MCP: deploy automático configurado

## Tareas pendientes
1. Cambiar el src del logo en el HTML de la URL de ibb a `./logo fustersaura sin fondo.png`
2. Crear Netlify Function `/.netlify/functions/anthropic-proxy` que haga de proxy seguro para la API de Anthropic
3. Actualizar el HTML para que llame a la Netlify Function en lugar de a `api.anthropic.com` directamente
4. Crear `netlify.toml` con la configuración de funciones
5. Hacer push a GitHub y deploy a Netlify
6. Añadir variable de entorno `ANTHROPIC_API_KEY` en Netlify dashboard

## Notas
- La API key NO debe aparecer en ningún fichero del repositorio
- Estética FUSTERSAURA: granate #8B0000, navy #1B2A4A, gold #C8A951