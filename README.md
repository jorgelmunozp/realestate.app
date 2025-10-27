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
 - FAQ

## Introducción

Este proyecto fue creado con Create React App y evolucionado con una arquitectura modular. Está orientado a la gestión de inmuebles, con pantallas para alta/edición, carga de imágenes, datos del propietario y registro de trazas (historial). El frontend se integración con un backend configurable vía variables de entorno.

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

La app arranca en `http://locAxiost:3001` si `PORT=3001` (por defecto en `.env`).

4) Compilar para producción:

```
npm run build
```

## Variables de entorno

Las variables deben comenzar con `REACT_APP_` para ser inyectadas en el build de CRA.

Ejemplo de `.env` (desarrollo):

```
PORT=3001

# Backend y Frontend (DEV)
REACT_APP_BACKEND_URL=http://locAxiost:5235
REACT_APP_FRONTEND_URL=http://locAxiost:3001

# Endpoints relativos del backend
REACT_APP_ENDPOINT_LOGIN=/api/auth/login
REACT_APP_ENDPOINT_REGISTER=/api/auth/register
REACT_APP_ENDPOINT_PROPERTY=/api/property
REACT_APP_ENDPOINT_OWNER=/api/owner
REACT_APP_ENDPOINT_PROPERTYIMAGE=/api/propertyImage
REACT_APP_ENDPOINT_PROPERTYTRACE=/api/propertyTrace
REACT_APP_ENDPOINT_PASSWORD=/password
```

Notas:

- Para producción, definir `REACT_APP_BACKEND_URL` apuntando a la URL pública del backend.
- Las variables se leen en tiempo de build. Si cambias `.env`, reinicia `npm start`.
- Si usas token de sesión, el interceptor lo lee desde `sessionStorage` (clave `token`).

## Scripts de npm

- `npm start`: arranca el entorno de desarrollo.
- `npm test`: ejecuta pruebas con Jest/Testing Library.
- `npm run build`: compila artefAxios de producción en `build/`.
- `npm run eject`: expone configuración de CRA (operación no reversible).

## Estructura del proyecto

```
src/
  assets/styles/scss/          # SCSS global, mixins y estilos de componentes
  components/                  # Componentes reutilizables (Header, Menu, Inputs, etc.)
  modules/
    auth/                      # Login, Register, recuperación y reseteo de contraseña
    core/                      # Páginas públicas: Home, AboutUs, Contact, Index
    property/                  # Listado, detalle y formularios de inmueble
      dto/                     # Esquemas JSON base para normalización
      mapper/                  # Normalizadores y mapeo DTO <-> UI
      service/                 # Vistas AddProperty, EditProperty, CrudProperty
    owner/, propertyImage/, propertyTrace/ (dto/mapper/)
  routers/                     # AppRouter, rutas privadas/públicas, DashboardRoutes
  services/
    api/                       # Axios instance + errorWrapper
    fetch/                     # Hooks useFetch/Post/Patch/Delete
    store/                     # Redux Toolkit store + slices + persist
  utils/                       # Utilidades (p.ej. optimisticMerge)
  App.js / index.js            # Bootstrap de la aplicación
```

## Arquitectura y flujo

- Enrutamiento central en `src/routers/AppRouter.js` combinAño rutas públicas y privadas.
- Rutas privadas protegidas por `src/routers/PrivateRoute.js` en función de `state.auth.user.logged`.
- Estado global con Redux Toolkit en `src/services/store/store.js`, persistido en `sessionStorage` usAño redux-persist.
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
- `/add-property` → Alta de inmueble, propietario, imagen y trazas
- `/edit-property/:propertyId` → Edición de datos del inmueble

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
- `errorWrapper` normaliza respuestas de error y éxito, permitiendo trabajar con `{ ok, data, error }`.
- Hooks de datos:
  - `useFetch(apiUrl)` para lecturas simples (maneja `loading`/`error`).
  - `useFetchPost()`, `useFetchPatch()`, `useFetchDelete()` para mutaciones (devuelven funciones `postData`, `patchData`, etc.).
- Endpoints configurables por `.env`:
  - `REACT_APP_ENDPOINT_PROPERTY`, `REACT_APP_ENDPOINT_OWNER`, `REACT_APP_ENDPOINT_PROPERTYIMAGE`, `REACT_APP_ENDPOINT_PROPERTYTRACE`, `REACT_APP_ENDPOINT_LOGIN`, `REACT_APP_ENDPOINT_REGISTER`, `REACT_APP_ENDPOINT_PASSWORD` (base para recover/update).

## Integración con backend (alineado)

- Casing JSON: el backend expone camelCase. En formularios complejos este frontend usa mapeadores (`mapper/*`) para convertir entre el modelo de UI y los DTO requeridos por la API (camelCase/PascalCase según módulo).
- Wrappers de respuesta:
  - Éxito (Property): `{ success: true, statusCode, message, data, errors: [] }` (el frontend puede “unwrap” con `errorWrapper(..., { unwrap: true })`).
  - Éxito (otros módulos): pueden retornar DTO plano. `errorWrapper` lo normaliza a `{ ok: true, data }`.
  - Error (global): `{ success: false, statusCode, message, errors: string[], data: null }`. `normalizeError` produce un objeto amigable.
- Caché/refresh: muchas consultas aceptan `?refresh=true` para forzar datos frescos. La UI lo utiliza tras operaciones de creación/edición/eliminación para revalidar listados.
- Seguridad: para endpoints protegidos, incluir `Authorization: Bearer <TOKEN>`. El interceptor toma el token desde `sessionStorage` (`token`).
- Rutas API esperadas (coincidir con backend):
  - Property: `/api/property`
  - Owner: `/api/owner`
  - PropertyImage: `/api/propertyimage` o `/api/propertyImage` (ajustar a tu API)
  - PropertyTrace: `/api/propertytrace` o `/api/propertyTrace` (ajustar a tu API)

### Flujo E2E de registro de inmueble

1) Crear Owner → `POST /api/owner`
2) Crear Property referenciando `idOwner` → `POST /api/property`
3) Si hay imagen, crear PropertyImage referenciando `idProperty` → `POST /api/propertyimage`
4) Crear uno o más PropertyTrace con `idProperty` → `POST /api/propertytrace` (soportado)

Este orden y los mAxios están implementados en `src/modules/property/service/AddProperty.js`.

## Compatibilidad de endpoints (ejemplos)

Notas generales:
- Casing JSON: `camelCase` en la API. El frontend mapea cuAño un módulo espera PascalCase.
- Wrappers: Property puede devolver wrapper de éxito. Errores devuelven wrapper unificado.
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
    "roles": ["admin"]
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
  "newPassword": "NuevaContraseña#2024"
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
BACKEND="http://locAxiost:5235"; EMAIL="user@example.com"; TOKEN="<token>"

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
- El frontend usa `errorWrapper` para normalizar respuestas y mostrar los mensajes de `message` cuAño existan.
- Asegúrate de definir `REACT_APP_ENDPOINT_PASSWORD` en `.env` para que ambas pantallas funcionen.

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
- password: requerida, 8–64, al menos 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial.
- register: mismas reglas, más confirmación de contraseña si aplica.

PUT/PATCH/DELETE: No aplican para Auth.

cURL:

```bash
BACKEND="http://locAxiost:5235"

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
- 400: Validación (email inválido, password débil).
- 401: Credenciales inválidas.

### Property

- `GET /api/property?name&address&idOwner&minPrice&maxPrice&page=1&limit=6&refresh=false`
- `GET /api/property/{id}`
- `POST /api/property` (201 con wrapper)
- `PATCH /api/property/{id}`
- `DELETE /api/property/{id}`

Request (POST):

```json
{
  "name": "Casa 123",
  "address": "Calle 1 #2-3",
  "price": 250000,
  "codeInternal": 123,
  "year": 2020,
  "idOwner": "64f0c5d8a1b2c3d4e5f67890"
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
    "address": "Calle 1 #2-3",
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

PUT (actualización completa):

```json
{
  "name": "Casa 123 remodelada",
  "address": "Calle 1 #2-3",
  "price": 275000,
  "codeInternal": 123,
  "year": 2021,
  "idOwner": "64f0c5d8a1b2c3d4e5f67890"
}
```

PATCH (parcial):

```json
{
  "price": 280000,
  "year": 2022
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
BACKEND="http://locAxiost:5235"; TOKEN="<JWT>"

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
    "idOwner": "64f0c5d8a1b2c3d4e5f67890"
  }'

# PUT
curl -X PUT "$BACKEND/api/property/PROPERTY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Casa 123 remodelada",
    "address": "Calle 1 #2-3",
    "price": 275000,
    "codeInternal": 123,
    "year": 2021,
    "idOwner": "64f0c5d8a1b2c3d4e5f67890"
  }'

# PATCH
curl -X PATCH "$BACKEND/api/property/PROPERTY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "price": 280000, "year": 2022 }'

# DELETE
curl -X DELETE "$BACKEND/api/property/PROPERTY_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Errores comunes:
- 400: Validación (nombre corto, price <= 0, Año inválido).
- 404: Propiedad no encontrada.
- 409: Conflicto por `codeInternal` duplicado.

### Owner

- `GET /api/owner?name&address&refresh=false`
- `GET /api/owner/{id}`
- `POST /api/owner`
- `PUT /api/owner/{id}`
- `PATCH /api/owner/{id}`
- `DELETE /api/owner/{id}`

Request (POST):

```json
{
  "name": "Jane Roe",
  "address": "Av 123",
  "birthday": "1990-01-01"
}
```

Respuesta (201 ejemplo, sin wrapper):

```json
{
  "idOwner": "...",
  "name": "Jane Roe",
  "address": "Av 123",
  "birthday": "1990-01-01"
}
```

GET (lista): `GET /api/owner?name=jane&address=av&refresh=false`

GET (detalle): `GET /api/owner/{id}`

PUT (completo):

```json
{
  "name": "Jane Roe",
  "address": "Av 123",
  "birthday": "1990-01-01"
}
```

PATCH (parcial):

```json
{
  "address": "Av 987"
}
```

DELETE: `DELETE /api/owner/{id}` → 204 No Content.

Validaciónes (FluentValidación sugeridas):
- name: requerido, 3–100.
- address: requerido, 3–150.
- birthday: opcional, fecha válida, <= hoy.

cURL:

```bash
BACKEND="http://locAxiost:5235"; TOKEN="<JWT>"

# Listar
curl "$BACKEND/api/owner?name=jane&address=av&refresh=false" \
  -H "Authorization: Bearer $TOKEN"

# Detalle
curl "$BACKEND/api/owner/OWNER_ID" \
  -H "Authorization: Bearer $TOKEN"

# Crear
curl -X POST "$BACKEND/api/owner" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Jane Roe", "address": "Av 123", "birthday": "1990-01-01" }'

# PUT
curl -X PUT "$BACKEND/api/owner/OWNER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Jane Roe", "address": "Av 987", "birthday": "1990-01-01" }'

# PATCH
curl -X PATCH "$BACKEND/api/owner/OWNER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "address": "Av 321" }'

# DELETE
curl -X DELETE "$BACKEND/api/owner/OWNER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Errores comunes:
- 400: Validación (name/address cortos, birthday futuro o inválido).
- 404: Owner no encontrado.

### PropertyImage

- `GET /api/propertyimage?idProperty&enabled&page=1&limit=10&refresh=false`
- `GET /api/propertyimage/{idPropertyImage}`
- `GET /api/propertyimage/property/{propertyId}`
- `POST /api/propertyimage`
- `PATCH /api/propertyimage/{idPropertyImage}`
- `DELETE /api/propertyimage/{idPropertyImage}`

Request (POST):

```json
{
  "idProperty": "...",
  "file": "<BASE64>",
  "enabled": true
}
```

Respuesta (201 ejemplo):

```json
{
  "idPropertyImage": "...",
  "idProperty": "...",
  "file": "<BASE64>",
  "enabled": true
}
```

GET (lista): `GET /api/propertyimage?idProperty={id}&enabled=true&page=1&limit=10&refresh=false`

GET (por id): `GET /api/propertyimage/{idPropertyImage}`

GET (por propiedad): `GET /api/propertyimage/property/{propertyId}`

PUT (completo):

```json
{
  "idProperty": "...",
  "file": "<BASE64>",
  "enabled": false
}
```

PATCH (parcial):

```json
{
  "enabled": true
}
```

DELETE: `DELETE /api/propertyimage/{idPropertyImage}` → 204 No Content.

Validaciónes (FluentValidación sugeridas):
- idProperty: requerido.
- file: requerido en POST, base64 válido; opcional en PUT/PATCH según caso.
- enabled: boolean.

cURL:

```bash
BACKEND="http://locAxiost:5235"; TOKEN="<JWT>"; BASE64="iVBORw0KGgoAAA..."

# Listar
curl "$BACKEND/api/propertyimage?idProperty=PROPERTY_ID&enabled=true&page=1&limit=10&refresh=false" \
  -H "Authorization: Bearer $TOKEN"

# Por id
curl "$BACKEND/api/propertyimage/IMAGE_ID" \
  -H "Authorization: Bearer $TOKEN"

# Por propiedad
curl "$BACKEND/api/propertyimage/property/PROPERTY_ID" \
  -H "Authorization: Bearer $TOKEN"

# Crear
curl -X POST "$BACKEND/api/propertyimage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "idProperty": "PROPERTY_ID", "file": "'$BASE64'", "enabled": true }'

# PUT
curl -X PUT "$BACKEND/api/propertyimage/IMAGE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "idProperty": "PROPERTY_ID", "file": "'$BASE64'", "enabled": false }'

# PATCH
curl -X PATCH "$BACKEND/api/propertyimage/IMAGE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "enabled": true }'

# DELETE
curl -X DELETE "$BACKEND/api/propertyimage/IMAGE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Errores comunes:
- 400: `file` inválido (no base64, vacío).
- 404: Imagen o Propiedad no encontrada.
- 413: Tamapeo de imagen excede límite.
- 415: Tipo de contenido no soportado (si el backend lo valida).

### PropertyTrace

- `GET /api/propertytrace?idProperty&refresh=false`
- `GET /api/propertytrace/{id}`
- `POST /api/propertytrace` (admite lote)
- `PUT /api/propertytrace/{id}`
- `PATCH /api/propertytrace/{id}`
- `DELETE /api/propertytrace/{id}`

Request (POST lote):

```json
[
  {
    "idProperty": "...",
    "dateSale": "2024-01-01",
    "name": "Compra",
    "value": 200000,
    "tax": 10000
  }
]
```

Respuesta (201 ejemplo):

```json
[
  {
    "idPropertyTrace": "...",
    "idProperty": "...",
    "dateSale": "2024-01-01",
    "name": "Compra",
    "value": 200000,
    "tax": 10000
  }
]
```

GET (lista): `GET /api/propertytrace?idProperty={id}&refresh=false`

GET (detalle): `GET /api/propertytrace/{id}`

PUT (completo):

```json
{
  "idProperty": "...",
  "dateSale": "2024-02-02",
  "name": "Venta",
  "value": 300000,
  "tax": 15000
}
```

PATCH (parcial):

```json
{
  "tax": 20000
}
```

DELETE: `DELETE /api/propertytrace/{id}` → 204 No Content.

Validaciónes (FluentValidación sugeridas):
- idProperty: requerido.
- dateSale: requerido, fecha válida.
- name: requerido, 2–100.
- value: requerido, >= 0.
- tax: requerido, >= 0.

cURL:

```bash
BACKEND="http://locAxiost:5235"; TOKEN="<JWT>"

# Listar por propiedad
curl "$BACKEND/api/propertytrace?idProperty=PROPERTY_ID&refresh=false" \
  -H "Authorization: Bearer $TOKEN"

# Detalle
curl "$BACKEND/api/propertytrace/TRACE_ID" \
  -H "Authorization: Bearer $TOKEN"

# Crear (lote)
curl -X POST "$BACKEND/api/propertytrace" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "idProperty": "PROPERTY_ID", "dateSale": "2024-01-01", "name": "Compra", "value": 200000, "tax": 10000 }]'

# PUT
curl -X PUT "$BACKEND/api/propertytrace/TRACE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "idProperty": "PROPERTY_ID", "dateSale": "2024-02-02", "name": "Venta", "value": 300000, "tax": 15000 }'

# PATCH
curl -X PATCH "$BACKEND/api/propertytrace/TRACE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "tax": 20000 }'

# DELETE
curl -X DELETE "$BACKEND/api/propertytrace/TRACE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Errores comunes:
- 400: Validación (value/tax negativos, dateSale inválida).
- 404: Trace o Propiedad no encontrada.

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
  "name": "John Doe",
  "roles": ["admin"]
}
```

GET (lista): `GET /api/user?refresh=false` (protegido)

GET (detalle por email): `GET /api/user/{email}?refresh=false` (protegido)

POST (crear):

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["admin"]
}
```

PUT (completo):

```json
{
  "name": "John A. Doe",
  "roles": ["admin", "editor"]
}
```

PATCH (parcial):

```json
{
  "roles": ["editor"]
}
```

DELETE: `DELETE /api/user/{email}` → 204 No Content.

Validaciónes (FluentValidación sugeridas):
- email: requerido, formato válido.
- name: opcional, 3–100.
- roles: opcional, array de strings de una lista permitida.

cURL:

```bash
BACKEND="http://locAxiost:5235"; TOKEN="<JWT>"

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
  -d '{ "email": "user@example.com", "name": "John Doe", "roles": ["admin"] }'

# PUT
curl -X PUT "$BACKEND/api/user/user@example.com" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "John A. Doe", "roles": ["admin", "editor"] }'

# PATCH
curl -X PATCH "$BACKEND/api/user/user@example.com" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "roles": ["editor"] }'

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
- Componente `Title`, `Input`, `AddButton`, `Header`, `AppMenu` con estilos asociados.
- Color primapeo configurable en `src/global.js`.

## Pruebas

- Testing con Jest + React Testing Library.
- Scripts: `npm test`.
- Pruebas de ejemplo: `src/modules/core/home/Home.test.js`, `src/utils/optimisticMerge.test.js`.

## Despliegue

- Generar build: `npm run build` (se produce en `build/`).
- Servir el `build/` desde un hosting estático o detrás de un servidor web.
- Asegurar que las variables `REACT_APP_*` apunten al backend correcto antes del build.
- Si usas enrutamiento con `BrowserRouter`, configura reglas de fallback a `index.html` en el servidor (SPA).

## Resolución de problemas

- La app no levanta en el puerto esperado: verifica `PORT` en `.env` o conflictos locales.
- Los cambios en `.env` no se reflejan: reinicia `npm start` (CRA lee variables al inicio).
- Errores 401/403: confirma que `sessionStorage` tenga `token` válido o revisa CORS en el backend.
- 404 en rutas internas tras refresh en producción: configura fallback SPA a `index.html` en tu hosting.
- Caracteres extrAxios en textos acentuados: asegúrate de guardar archivos en `UTF-8`.

---

Archivos de soporte:
- `.env.example` con variables esperadas en desarrollo.

Notas de compatibilidad:
- Este frontend usa Create React App (CRA) para el entorno de build/arranque. Si tu backend documenta Vite, los objetivos son equivalentes para desarrollo/producción. Una migración a Vite es opcional y no requerida para operar con la API descrita.

## Flujos de UI

- Login: guarda `token` y datos mínimos del usuario en `sessionStorage` (vía acciones `login`), redirige a última ruta (`lastPath`).
- Listado de inmuebles (`/home`): paginado, carga imágenes por inmueble, actions de editar/eliminar, buscador local por nombre.
- Alta de inmueble (`/add-property`): crea Owner → Property → PropertyImage → PropertyTrace (lote opcional). Al finalizar, alerta de éxito y refresh del listado.
- Edición (`/edit-property/:id`): formulAño similar al alta, preserva y permite reemplazar imagen.
- Detalle público (`/property/:id`): muestra imagen principal, propietario y trazas.

## Convenciones de código

- Componentes y hooks en inglés; textos de UI en español (i18n opcional).
- Componentes en PascalCase, archivos `.js` con extensión explícita en imports internos.
- Estilos SCSS por componente: mismo nombre de carpeta/archivo (`Component/Component.scss`).
- Módulos con subcarpetas `dto/`, `mapper/`, `service/` cuAño aplique.
- Redux Toolkit slices en `src/services/store/*Slice.js`.

## Rendimiento y accesibilidad

- Imágenes con `loading="lazy"` y placeholders cuAño aplica.
- Listados paginados para evitar cargas grandes.
- Minimizar re-render usAño `useCallback` en operaciones intensivas.
- Colores con suficiente contraste y foco visible por defecto (MUI + estilos propios).

## Checklist de producción

- [ ] Definir `REACT_APP_BACKEND_URL` y endpoints exAxios en `.env`.
- [ ] Configurar CORS en backend con dominios permitidos.
- [ ] Asegurar fallback SPA a `index.html` en hosting.
- [ ] Revisar que el token JWT se almacene de forma segura (sesión, expiración).
- [ ] Ejecutar `npm run build` y servir `build/` detrás de TLS (HTTPS).

## FAQ

- ¿Por qué algunas respuestas vienen con wrapper y otras no?
  - El módulo Property estandariza con wrapper de éxito; `errorWrapper` en frontend abstrae estas diferencias.
- ¿Dónde se almacena el token?
  - En `sessionStorage` (clave `token`) para que expire al cerrar el navegador. Puedes migrarlo a cookies httpOnly si el backend lo soporta.
- ¿Cómo fuerzo datos frescos tras una mutación?
  - Usa `?refresh=true` en listados o re-fetch desde la UI (ya implementado en `Home`).





