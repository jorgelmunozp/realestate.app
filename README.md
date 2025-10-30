# Real Estate App — Frontend

![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![Redux](https://img.shields.io/badge/State-Redux_Toolkit-764abc?logo=redux)
![MUI](https://img.shields.io/badge/UI-MUI-007FFF?logo=mui)
![Axios](https://img.shields.io/badge/HTTP-Axios-5A29E4)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens)

Aplicación web frontend para gestionar inmuebles (crear, listar, editar, eliminar), propietarios, imágenes y trazas de transacciones. Incluye autenticación, enrutamiento público/privado, consumo de API vía Axios, manejo centralizado de errores y almacenamiento de sesión con Redux Toolkit + redux-persist.

## Tabla de contenidos

- Introducción
- Stack y dependencias clave
- Requisitos
- Instalación y ejecución
- Variables de entorno
- Scripts de npm
- Estructura del proyecto
- Arquitectura y flujo
 - Arquitectura (mermaid)
- Rutas y navegación
- Estado global (Redux)
- Consumo de API y manejo de errores
- Integración con backend (alineado)
 - Compatibilidad de endpoints (ejemplos)
- Estilos y UI
- Pruebas
- Despliegue
- Resolución de problemas
 - Flujos de UI
 - Convenciones de código
 - Rendimiento y accesibilidad
 - Checklist de producción

## Introducción

Este proyecto fue creado con Create React App y evolucionado con una arquitectura modular. Está orientado a la gestión de inmuebles, con pantallas para registro/edición, carga de imágenes, datos del propietario y registro de trazas (historial). El frontend se integración con un backend configurable vía variables de entorno.

## Stack y dependencias clave

- React 19 + react-scripts 5
- React Router DOM 7 (rutas públicas y privadas)
- Redux Toolkit + redux-persist (sessionStorage)
- Material UI (@mui/material, @mui/x-date-pickers, @emotion/*)
- Axios (cliente HTTP) + interceptores
- Sass (SCSS) para estilos personalizados
- Dayjs (manejo de fechas)
- SweetAlert2 (diálogos y confirmapeones)

## Requisitos

- Node.js 18+ y npm 9+ (recomendado)
- Backend disponible (local o remoto) expuesto en `REACT_APP_BACKEND_URL`

## Instalación y ejecución

1) Instalar dependencias:

```
npm install
```

2) Configurar variables de entorno (ver sección "Variables de entorno").

3) Ejecutar en desarrollo:

```
npm start
```

La app arranca en `http://localhost:3001` si `PORT=3001` (por defecto en `.env`).

4) Compilar para producción:

```
npm run build
```

## Variables de entorno

Las variables deben comenzar con `REACT_APP_` para ser inyectadas en el build de CRA.

Ejemplo de `.env` (desarrollo):

```
#DEV
PORT=3001
# REACT_APP_BACKEND_URL=http://localhost:5235
# REACT_APP_FRONTEND_BASEPATH=/

#PROD
REACT_APP_BACKEND_URL=https://realestate-api-r76f.onrender.com
REACT_APP_FRONTEND_BASEPATH=/realestate.app

# Endpoints relativos del Backend
REACT_APP_ENDPOINT_PROPERTY=/api/property
REACT_APP_ENDPOINT_TOKEN_GENERATE=/api/token/generate
REACT_APP_ENDPOINT_TOKEN_REFRESH=/api/token/refresh
REACT_APP_ENDPOINT_USER=/api/user
REACT_APP_ENDPOINT_LOGIN=/api/auth/login
REACT_APP_ENDPOINT_REGISTER=/api/auth/register
REACT_APP_ENDPOINT_PASSWORD_RECOVER=/api/password/recover
REACT_APP_ENDPOINT_PASSWORD_RESET=/api/password/update
```

Notas:

- Para producción, definir `REACT_APP_BACKEND_URL` apuntando a la URL pública del backend.
- Al autenticarse se usa token de sesión, el interceptor lo lee desde `sessionStorage` (clave `token`).

## Scripts de npm

- `npm start`: arranca el entorno de desarrollo.
- `npm test`: ejecuta pruebas con Jest/Testing Library.
- `npm run build`: compila artefAxios de producción en `build/`.
- `npm run eject`: expone configuración de CRA (operación no reversible).

## Estructura del proyecto

```
src/
  assets/styles/scss/          # SCSS global, mixins y estilos de componentes
  components/                  # Componentes (Header, Menu Inputs)
  modules/
    auth/                      # Login, Register, recuperación de contraseña
    core/                      # Páginas públicas: Home, AboutUs, Contact, Index
    property/                  # Listado, detalle y formularios de inmueble
      dto/                     # Esquemas JSON base para normalización
      mapper/                  # Normalizadores y mapeo DTO <-> UI
      service/                 # Vistas AddProperty, EditProperty, CrudProperty
    owner/
      dto/
      mapper/
    propertyImage/
      dto/
      mapper/
    propertyTrace/ 
      dto/
      mapper/
  routers/                     # Router, rutas privadas/públicas   
  services/
    api/                       # Axios instance + errorWrapper
    fetch/                     # Hooks useFetch
    store/                     # Redux Toolkit store + slices + persist
  tests/                       # Tests de la aplicación
  App.js / index.js            # Bootstrap de la aplicación
```

## Arquitectura y flujo

- Enrutamiento central en `src/routers/AppRouter.js` combinando rutas públicas y privadas.
- Rutas privadas protegidas por `src/routers/PrivateRoute.js` en función de `state.auth.user.logged`.
- Estado global con Redux Toolkit en `src/services/store/store.js`, persistido en `sessionStorage` usando redux-persist.
- Consumo de servicios vía `src/services/api/api.js` (Axios). Interceptor agrega `Authorization: Bearer <token>` si existe en `sessionStorage`.
- Manejo uniforme de errores con `src/services/api/errorWrapper.js` para respuestas normalizadas.
- formularios complejos (crear/editar inmueble) en `src/modules/property/service/` con Material UI y Date Pickers.

## Arquitectura (mermaid)

```mermaid
flowchart LR
  A[Frontend (React)] --> B[Axios]
  B --> C[API (ASP.NET Core)]
  C --> D[DTO]
  D --> E[Validator (FluentValidación)]
  E --> F[Mapper]
  F --> G[Model]
  G --> H[(MongoDB)]
```

Módulos principales de negocio consumidos por este frontend: Auth, User, Owner, Property, PropertyImage, PropertyTrace.

## Rutas y navegación

Rutas públicas principales (ver `src/routers/AppRouter.js`):

- `/index` y `/` → Landing pública (`Index`)
- `/property/:propertyId` → Detalle público de inmueble
- `/login` y `/register` → Autenticación y registro
- `/password-recover` y `/password-reset/:token` → Recuperación de contraseña
- `/about-us` y `/contact` → Información corporativa

Rutas privadas (Dashboard):

- `/home` → Listado de inmuebles del usuario, paginado y con carga de imágenes
- `/add-property` → Registro de inmueble, propietario, imagen y trazas
- `/edit-property/:propertyId` → Edición de datos del inmueble
- `/profile` → Perfil del usuario con su rol
- `/profile/edit` → Edición de datos del usuario, solo en rol editor y admin
- `/users` → Edición de datos de todos los usuarios, solo en rol admin

Comportamiento de seguridad:

- `PublicRoute` redirige a dashboard si el usuario ya está autenticado.
- `PrivateRoute` redirige a página pública si `auth.user.logged` es falso.
- Se guarda `lastPath` en `sessionStorage` para retorno post-login.

## Estado global (Redux)

- Slice principal: `src/services/store/authSlice.js` con `user: { logged: boolean, ... }`.
- Acciones: `login(payload)` y `logout()`.
- Persistencia: configurada en `src/services/store/store.js` con `redux-persist` usAño `sessionStorage` (la sesión expira al cerrar el navegador).

## Consumo de API y manejo de errores

- Cliente Axios central: `src/services/api/api.js` con `baseURL = REACT_APP_BACKEND_URL` y timeout 20s.
- Interceptor de request agrega `Authorization` si encuentra `token` en `sessionStorage`.
- `errorWrapper` normaliza respuestas de error y success, permitiendo trabajar con `{ ok, data, error }`.
- Hooks de datos:
  - `useFetch(apiUrl)` para lecturas simples (maneja `loading`/`error`).
  - `useFetchPost()`, `useFetchPatch()`, `useFetchDelete()` para mutaciones (devuelven funciones `postData`, `patchData`, etc.).
- Endpoints configurables por `.env`:
  - `REACT_APP_ENDPOINT_PROPERTY`, `REACT_APP_ENDPOINT_OWNER`, `REACT_APP_ENDPOINT_PROPERTYIMAGE`, `REACT_APP_ENDPOINT_PROPERTYTRACE`, `REACT_APP_ENDPOINT_LOGIN`, `REACT_APP_ENDPOINT_REGISTER`, `REACT_APP_ENDPOINT_PASSWORD` (base para recover/update).

## Integración con backend (alineado)

- Casing JSON: el backend expone camelCase. En formularios complejos este frontend usa mapeadores (`mapper/*`) para convertir entre el modelo de UI y los DTO requeridos por la API (camelCase/PascalCase según módulo).
- Wrappers de respuesta:
  - Success (Property): `{ success: true, statusCode, message, data, errors: [] }` (el frontend puede “unwrap” con `errorWrapper(..., { unwrap: true })`).
  - Success (otros módulos): pueden retornar DTO plano. `errorWrapper` lo normaliza a `{ ok: true, data }`.
  - Error (global): `{ success: false, statusCode, message, errors: string[], data: null }`. `normalizeError` produce un objeto amigable.
- Caché/refresh: muchas consultas aceptan `?refresh=true` para forzar datos frescos. La UI lo utiliza tras operaciones de creación/edición/eliminación para revalidar listados.
- Seguridad: para endpoints protegidos, incluir `Authorization: Bearer <TOKEN>`. El interceptor toma el token desde `sessionStorage` (`token`).
- Rutas API esperadas (coincidir con backend):
  - Property: `/api/property`
  - User: `/api/user`
  - Auth: `/api/auth`

### Flujo E2E de registro de inmueble

- Crea Property referenciando `Owner, Image, Trace`
- Recibe respuesta de creación `Ok, Error`

Este orden y los métodos están implementados en `src/modules/property/service/AddProperty.js`.

## Compatibilidad de endpoints (ejemplos)

Notas generales:
- Casing JSON: `camelCase` en la API. El frontend mapea cuando un módulo espera PascalCase.
- Wrappers: Property puede devolver wrapper de success. Errores devuelven wrapper unificado.
- Autenticación: enviar `Authorization: Bearer <TOKEN>` en endpoints protegidos.
- Parámetro `refresh=true`: fuerza data fresca omitendo caché.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

Request (login):

```json
{
  "email": "user@example.com",
  "password": "Secret123!"
}
```

Respuesta (200 ejemplo):

```json
{
  "token": "<JWT>",
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

### Password (Recover/Reset)

- Base configurada por entorno: `REACT_APP_ENDPOINT_PASSWORD` (por ejemplo, `/api/password`).
- Endpoints derivados en el frontend:
  - Recover: `${REACT_APP_ENDPOINT_PASSWORD}/recover` (POST)
  - Reset: `${REACT_APP_ENDPOINT_PASSWORD}/update` (PATCH)

Recover (enviar enlace) — Request:

```json
{
  "email": "user@example.com"
}
```

Recover — Respuesta esperada (ejemplo):

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Se envió un enlace de recuperación al correo",
  "data": null,
  "errors": []
}
```

Reset (actualizar contraseña) — Request:

```json
{
  "token": "<token-de-recuperación>",
  "newPassword": "NuevaContraseña123"
}
```

Reset — Respuesta (ejemplo):

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Contraseña actualizada",
  "data": null,
  "errors": []
}
```

cURL de ejemplo:

```bash
BACKEND="http://localhost:5235"; EMAIL="user@example.com"; TOKEN="<token>"

# Recover
curl -X POST "$BACKEND/api/password/recover" \
  -H "Content-Type: application/json" \
  -d "{ \"email\": \"$EMAIL\" }"

# Reset
curl -X PATCH "$BACKEND/api/password/update" \
  -H "Content-Type: application/json" \
  -d "{ \"token\": \"$TOKEN\", \"newPassword\": \"NuevaContraseña#2024\" }"
```

Notas:
- El frontend usa `errorWrapper` para normalizar respuestas y mostrar los mensajes de `message` cuando existan.

Wrapper de error (401/400):

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Credenciales inválidas",
  "errors": ["usuario o contraseña incorrectos"],
  "data": null
}
```

Validaciónes (FluentValidación sugeridas):
- email: requerido, formato válido, longitud 5–256.
- password: requerida, 6–64, al menos 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial.
- register: mismas reglas, más confirmación de contraseña si aplica.

PUT/PATCH/DELETE: No aplican para Auth.

cURL:

```bash
BACKEND="http://localhost:5235"

# Register
curl -X POST "$BACKEND/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Secret123!"
  }'

# Login
curl -X POST "$BACKEND/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Secret123!"
  }'
```

Errores comunes:
- 400: Validación (email inválido).
- 401: Credenciales inválidas.

### Property

- `GET /api/property?name&address&idOwner&minPrice&maxPrice&page=1&limit=6&refresh=false`
- `GET /api/property/{id}`
- `POST /api/property`
- `PATCH /api/property/{id}`
- `DELETE /api/property/{id}`

Request (POST):

```json
{
  "name": "Casa 123",
  "address": "Calle 1 # 2-3",
  "price": 250000,
  "codeInternal": 123,
  "year": 2020,
  "owner": {
    "name": "Casa 123",
    "address": "Calle 1 #2-3",
    "birthday": "1970-10-10"
  },
  "image": {
    "file": "<Imagen Base64>",
    "enabled": true,
  },
  "traces": [{
    "name": "Venta",
    "datesale": "2000-01-01",
    "value": 350000000,
    "tax": 10
  }]
}
```

Respuesta (201 + wrapper):

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Propiedad creada exitosamente",
  "data": {
    "idProperty": "...",
    "name": "Casa 123",
    "address": "Calle 1 # 2-3",
    "price": 250000,
    "codeInternal": 123,
    "year": 2020,
    "idOwner": "64f0c5d8a1b2c3d4e5f67890"
  },
  "errors": []
}
```

GET (lista) con filtros y paginación:

`GET /api/property?name=casa&address=calle&page=1&limit=6&minPrice=100000&maxPrice=500000&refresh=false`

GET (detalle):
`GET /api/property/{id}`

PATCH/PUT

```json
{
  "idProperty": "88f0c3a6a1b2c3d4e5f6f888",
  "name": "Casa 123 remodelada",
  "address": "Calle 1 #2-3",
  "price": 275000,
  "codeInternal": 123,
  "year": 2021,
  "idOwner": "64f0c5d8a1b2c3d4e5f67890",
  "owner": {
    "idOwner": "64f0c5d8a1b2c3d4e5f67890",
    "name": "Casa 123",
    "address": "Calle 1 #2-3",
    "birthday": "1970-10-10"
  },
  "image": {
    "idPropertyImage": "12f0c5d8a1b2c3d4e5f12345",
    "file": "<Imagen Base64>",
    "enabled": true,
    "idProperty": "88f0c3a6a1b2c3d4e5f6f888",
  },
  "traces": [{
    "idPropertyTrace": "99f0c5d8a1b2c3d4e5f98755",
    "name": "Venta",
    "datesale": "2000-01-01",
    "value": 350000000,
    "tax": 10
  }]
}
```

DELETE: `DELETE /api/property/{id}` → 204 No Content (o 200 con wrapper según configuración).

Validaciónes (FluentValidación sugeridas):
- name: requerido, longitud 3–100.
- address: requerido, longitud 3–150.
- price: requerido, > 0.
- codeInternal: opcional, >= 0.
- year: opcional, entre 1900 y el Año actual.
- idOwner: requerido, string no vacío (ObjectId válido si aplica).

cURL:

```bash
BACKEND="http://localhost:5235"; TOKEN="<JWT>"

# Listar
curl "$BACKEND/api/property?page=1&limit=6&refresh=false" \
  -H "Authorization: Bearer $TOKEN"

# Detalle
curl "$BACKEND/api/property/PROPERTY_ID" \
  -H "Authorization: Bearer $TOKEN"

# Crear
curl -X POST "$BACKEND/api/property" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Casa 123",
    "address": "Calle 1 #2-3",
    "price": 250000,
    "codeInternal": 123,
    "year": 2020,
    "owner": {
      "name": "Casa 123",
      "address": "Calle 1 #2-3",
      "birthday": "1970-10-10"
    },
    "image": {
      "file": "<Imagen Base64>",
      "enabled": true
    },
    "traces": [{
      "name": "Venta",
      "datesale": "2000-01-01",
      "value": 350000000,
      "tax": 10
    }]
  }'

# PATCH
curl -X PATCH "$BACKEND/api/property/PROPERTY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
      "idProperty": "88f0c3a6a1b2c3d4e5f6f888",
      "name": "Casa 123 remodelada",
      "address": "Calle 1 #2-3",
      "price": 275000,
      "codeInternal": 123,
      "year": 2021,
      "idOwner": "64f0c5d8a1b2c3d4e5f67890",
      "owner": {
        "idOwner": "64f0c5d8a1b2c3d4e5f67890",
        "name": "Casa 123",
        "address": "Calle 1 #2-3",
        "birthday": "1970-10-10"
      },
      "image": {
        "idPropertyImage": "12f0c5d8a1b2c3d4e5f12345",
        "file": "<Imagen Base64>",
        "enabled": true,
        "idProperty": "88f0c3a6a1b2c3d4e5f6f888",
      },
      "traces": [{
        "idPropertyTrace": "99f0c5d8a1b2c3d4e5f98755",
        "name": "Venta",
        "datesale": "2000-01-01",
        "value": 350000000,
        "tax": 10
      }]
  }'

# DELETE
curl -X DELETE "$BACKEND/api/property/PROPERTY_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Errores comunes:
- 400: Validación (nombre corto, price <= 0, Año inválido).
- 404: Propiedad no encontrada.
- 409: Conflicto por `codeInternal` duplicado.

### User

- `GET /api/user?refresh=false` (protegido)
- `GET /api/user/{email}?refresh=false` (protegido)
- `POST /api/user`
- `PUT /api/user/{email}` (protegido)
- `DELETE /api/user/{email}` (protegido)

Respuesta (200 ejemplo):

```json
{
  "email": "user@example.com",
  "name": "Jose Díaz",
  "role": "user"
}
```

GET (lista): `GET /api/user?refresh=false` (protegido)

GET (detalle por email): `GET /api/user/{email}?refresh=false` (protegido)

POST (crear):

```json
{
  "email": "user@example.com",
  "name": "Jose Díaz"
}
```

PATCH/PUT:

```json
{
  "name": "John A. Doe",
  "role": ["admin", "editor"]
}
```

DELETE: `DELETE /api/user/{email}` → 204 No Content.

Validaciónes (FluentValidación sugeridas):
- email: requerido, formato válido.
- name: opcional, 3–100.
- roles: opcional, array de strings de una lista permitida.

cURL:

```bash
BACKEND="http://localhost:5235"; TOKEN="<JWT>"

# Listar (protegido)
curl "$BACKEND/api/user?refresh=false" \
  -H "Authorization: Bearer $TOKEN"

# Detalle
curl "$BACKEND/api/user/user@example.com?refresh=false" \
  -H "Authorization: Bearer $TOKEN"

# Crear
curl -X POST "$BACKEND/api/user" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "name": "Jose Díaz" }'

# PUT
curl -X PUT "$BACKEND/api/user/user@example.com" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Jose Díaz", "role": "admin" }'

# PATCH
curl -X PATCH "$BACKEND/api/user/user@example.com" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "role": "editor" }'

# DELETE
curl -X DELETE "$BACKEND/api/user/user@example.com" \
  -H "Authorization: Bearer $TOKEN"
```

Errores comunes:
- 400: Validación (email inválido, roles no permitidos).
- 401/403: Falta token o permisos insuficientes.
- 404: usuario no encontrado.
- 409: Email ya existe (en creación) o conflicto de actualización.

## Estilos y UI

- Base de componentes con Material UI y estilos propios SCSS.
- Carpeta `src/assets/styles/scss/` con mixins de colores, tipografía y media queries.
- Componente `AppMenu`, `Title`, `Input`, `AddButton`, `Header`, `Button`  con estilos asociados.
- Color primapeo configurable en `src/global.js`.

## Pruebas

- Testing con Jest + React Testing Library.
- Scripts: `npm test`.
- Pruebas de ejemplo: `src/modules/core/home/Home.test.js`.

## Despliegue

- Generar build: `npm run build` (se produce en `build/`).
- Servir el `build/` desde un hosting estático o detrás de un servidor web.
- Asegurar que las variables `REACT_APP_*` apunten al backend correcto antes del build.
- Si usas enrutamiento con `BrowserRouter`, configura reglas de fallback a `index.html` en el servidor (SPA).

## Flujos de UI

- Login: guarda `token` y datos mínimos del usuario en `sessionStorage` (vía acciones `login`), redirige a última ruta (`lastPath`).
- Listado de inmuebles (`/home`): paginado, carga imágenes por inmueble, actions de editar/eliminar, buscador local por nombre.
- Registro de inmueble (`/add-property`): crea Owner → Property → PropertyImage → PropertyTrace (lote opcional). Al finalizar, alerta de success y refresh del listado.
- Edición (`/edit-property/:id`): formulario similar al registro, preserva y permite reemplazar imagen.
- Detalle público (`/property/:id`): muestra imagen principal, propietario y trazas.

## Convenciones de código

- Componentes y hooks en inglés; textos de UI en español (i18n opcional).
- Componentes en PascalCase, archivos `.js` con extensión explícita en imports internos.
- Estilos SCSS por componente: mismo nombre de carpeta/archivo (`Component/Component.scss`).
- Módulos con subcarpetas `dto/`, `mapper/`, `service/`, `tests/` cuando aplique.
- Redux Toolkit slices en `src/services/store/*Slice.js`.

## Rendimiento y accesibilidad

- Imágenes con `loading="lazy"` y placeholders cuando aplica.
- Listados paginados para evitar cargas grandes.
- Minimizar re-render usando `useCallback` en operaciones intensivas.
- Colores con suficiente contraste y foco visible por defecto (MUI + estilos propios).

## Checklist de producción

- Definir `REACT_APP_BACKEND_URL` y endpoints exAxios en `.env`.
- Configurar CORS en backend con dominios permitidos.
- Asegurar fallback SPA a `index.html` en hosting.
- Revisar que el token JWT se almacene de forma segura (sesión, expiración).
- Ejecutar `npm run build` y servir `build/` detrás de TLS (HTTPS).

## Datos

- El módulo Property estandariza con wrapper de succes; `errorWrapper` en frontend abstrae estas diferencias.
- El token se almacena en `sessionStorage` (clave `token`) para que expire al cerrar el navegador. Puedes migrarlo a cookies httpOnly si el backend lo soporta.
- Se forzan datos frescos tras una mutacióncon `?refresh=true` en listados o re-fetch desde la UI (ya implementado en `Home`).





