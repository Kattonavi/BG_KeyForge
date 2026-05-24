# BG KeyForge

> Generador profesional de contraseñas **extremadamente seguro, privado y local**.
> *A professional, extremely secure, private and local password generator.*

BG KeyForge es una aplicación web que genera contraseñas criptográficamente seguras **directamente en tu navegador**. Las contraseñas nunca se envían al servidor, no se guardan en base de datos, no se almacenan en `localStorage`, cookies, logs ni analíticas, y no aparecen en URLs ni en `console.log`.

---

## Tabla de contenidos

- [Características](#características)
- [Privacidad y seguridad](#privacidad-y-seguridad)
- [Stack técnico](#stack-técnico)
- [Instalación](#instalación)
- [Ejecución local](#ejecución-local)
- [Build de producción](#build-de-producción)
- [Despliegue en Railway](#despliegue-en-railway)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cabeceras de seguridad](#cabeceras-de-seguridad)

---

## Características

- 🔐 **Generación 100% local** con [Web Crypto API](https://developer.mozilla.org/docs/Web/API/Web_Crypto_API) (`crypto.getRandomValues`).
- 🎲 **Selección sin sesgo** mediante *rejection sampling* sobre enteros de 32 bits.
- 🔀 **Mezcla segura** Fisher-Yates alimentada por la Web Crypto API.
- 📏 Longitud configurable entre **4** y **512**, por defecto **100**.
- 📦 Generación en lote de hasta **100** contraseñas.
- 🧠 Medición de fuerza con [`@zxcvbn-ts/core`](https://zxcvbn-ts.github.io/zxcvbn/) (también local).
- 🧾 Exportación a archivo `.txt` generado en el navegador (con advertencia previa).
- 🌐 Bilingüe **español / inglés** con [next-intl](https://next-intl-docs.vercel.app/).
- 🎨 Diseño oscuro, premium y glassmorphism con Tailwind + Framer Motion.
- ♿ Accesibilidad: labels correctos, navegación por teclado, `aria-label`, contraste alto.

---

## Privacidad y seguridad

> Lo que **NO** hacemos importa tanto como lo que sí hacemos.

- ❌ No usamos `Math.random()`. **Nunca.** Solo `crypto.getRandomValues()`.
- ❌ Las contraseñas no se envían al servidor: **no existe endpoint** que las reciba.
- ❌ No usamos base de datos.
- ❌ No usamos `localStorage`, `sessionStorage` ni cookies para guardar contraseñas.
- ❌ Las contraseñas **no aparecen** en URL, query params, rutas, logs ni `console.log`.
- ❌ No requerimos cuenta, registro ni correo.
- ❌ No registramos historial ni telemetría de generación.
- ✅ El medidor de fuerza (`zxcvbn`) corre íntegramente en el navegador.
- ✅ Puedes desconectarte de internet y el generador sigue funcionando idéntico.

### Cómo se generan

1. Se construye el conjunto de caracteres a partir de los grupos activos y los filtros (ambiguos, problemáticos).
2. Por cada posición de la contraseña se llama a `crypto.getRandomValues` y se aplica *rejection sampling*: cualquier valor que produciría sesgo al hacer módulo se descarta y se vuelve a sortear.
3. Si "Garantizar al menos uno de cada tipo" está activo, se inserta un carácter de cada grupo y luego se ejecuta un Fisher-Yates seguro (también con `crypto.getRandomValues`) para evitar patrones fijos al inicio.

Ver el código en [`src/lib/password/`](src/lib/password/).

---

## Stack técnico

| Capa | Tecnología |
| --- | --- |
| Framework | **Next.js 14** (App Router) |
| Lenguaje | **TypeScript** estricto |
| Estilos | **Tailwind CSS** + componentes estilo **shadcn/ui** sobre Radix |
| Animación | **Framer Motion** |
| i18n | **next-intl** (es / en) |
| Fuerza | **@zxcvbn-ts/core** |
| Iconos | **lucide-react** |
| Deploy | **Railway** (Nixpacks, Node ≥ 18) |

---

## Instalación

Requiere **Node.js 18.18+** (recomendado 20 LTS) y `npm` (o `pnpm` / `yarn`).

```bash
git clone <tu-repo> bg-keyforge
cd bg-keyforge
npm install
```

---

## Ejecución local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
La aplicación redirige automáticamente al locale por defecto (`/es`).

Otros scripts útiles:

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript estricto, sin emitir
```

---

## Build de producción

```bash
npm run build
npm run start
```

`npm run start` respeta `$PORT` (Railway lo inyecta).
Localmente puedes fijarlo manualmente: `PORT=4000 npm run start`.

---

## Despliegue en Railway

BG KeyForge está preparado para desplegarse en [Railway](https://railway.app) sin configuración adicional:

1. Sube el repositorio a GitHub.
2. En Railway → **New Project → Deploy from GitHub repo** y elige tu repo.
3. Railway detecta automáticamente Node.js (Nixpacks) y ejecutará:
   - **Install**: `npm install`
   - **Build**: `npm run build`
   - **Start**: `npm run start`
4. No se necesitan variables de entorno (BG KeyForge no usa ninguna).
5. Pulsa **Generate Domain** para obtener una URL pública.

> ⚠️ En producción, asegúrate de servir la app por **HTTPS** (Railway lo hace por defecto). La cabecera `Strict-Transport-Security` solo se emite cuando `NODE_ENV=production`.

### `railway.json` opcional

Si quieres bloquear comandos explícitamente, crea un `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Estructura del proyecto

```
.
├── messages/
│   ├── es.json              # textos en español
│   └── en.json              # english strings
├── src/
│   ├── app/
│   │   ├── layout.tsx       # root layout (carga fuente Inter)
│   │   ├── not-found.tsx    # 404 global
│   │   └── [locale]/
│   │       ├── layout.tsx   # provider de next-intl
│   │       ├── page.tsx     # landing con todas las secciones
│   │       └── not-found.tsx
│   ├── components/
│   │   ├── site/            # Navbar, Hero, Generator, Privacy, etc.
│   │   └── ui/              # primitives estilo shadcn (Button, Switch...)
│   ├── i18n/
│   │   ├── routing.ts       # configuración de locales y navegación
│   │   └── request.ts       # carga de mensajes por request
│   ├── lib/
│   │   ├── password/        # 🔐 motor criptográfico
│   │   │   ├── charsets.ts  # alfabetos + filtros (ambiguos/problemáticos)
│   │   │   ├── random.ts    # crypto.getRandomValues + rejection sampling + Fisher-Yates
│   │   │   ├── generate.ts  # generación de una/varias contraseñas
│   │   │   ├── strength.ts  # zxcvbn-ts (medición local)
│   │   │   └── index.ts
│   │   └── utils.ts
│   └── middleware.ts        # i18n routing
├── next.config.mjs          # cabeceras de seguridad
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Cabeceras de seguridad

Definidas en [`next.config.mjs`](next.config.mjs) y aplicadas a todas las rutas:

| Cabecera | Valor |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'`, sin `connect-src` externos, `frame-ancestors 'none'`, `object-src 'none'` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | desactiva cámara, micrófono, geolocalización, pagos, USB, FLoC |
| `Strict-Transport-Security` *(solo prod)* | `max-age=63072000; includeSubDomains; preload` |

`X-Powered-By` se elimina mediante `poweredByHeader: false`.

---

## Licencia

Usa, modifica y publica este proyecto libremente. **No incluyas ninguna contraseña real en logs, reportes ni capturas**.

— *Forjado con criptografía abierta. Hecho para tu privacidad.*
