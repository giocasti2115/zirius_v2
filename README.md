# ZIRIUZ v2 - Sistema de Gestión Dental

## Descripción
Sistema moderno de gestión para equipos odontológicos migrado de PHP a Node.js + React.

## Stack Tecnológico

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **JWT** para autenticación
- **MySQL** (compatible con datos existentes)
- **Joi** para validación
- **Helmet** + **CORS** para seguridad

### Frontend
- **Next.js 15** + **React 19**
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **Radix UI** para componentes
- **Sonner** para notificaciones

## Estructura del Proyecto

```
zirius_v2/
├── backend/                 # API Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/         # Rutas de API
│   │   ├── middleware/     # Middlewares de autenticación
│   │   ├── data/          # Datos de prueba
│   │   └── index.ts       # Servidor principal
│   ├── dist/              # Código compilado
│   └── package.json
│
└── frontend/               # Aplicación Next.js + React
    ├── app/               # App Router de Next.js
    ├── components/        # Componentes React reutilizables
    ├── lib/              # Utilidades y servicios API
    ├── contexts/         # Context providers
    └── package.json
```

## Características Implementadas

### ✅ Backend API Completo
- **Autenticación JWT** con usuarios de prueba
- **CRUD Completo** para Clientes, Sedes y Equipos
- **Paginación y Búsqueda** en todas las entidades
- **Control de Roles** (admin, tecnico, analista)
- **Datos de Prueba** para desarrollo sin MySQL
- **Validación de Datos** con Joi
- **Seguridad** con Helmet y CORS

### ✅ Usuarios de Prueba
```javascript
admin / admin123       - Administrador completo
tecnico1 / tecnico123  - Técnico de campo
analista1 / analista123 - Analista de datos
```

### ✅ API Endpoints Disponibles
```
POST   /api/v1/auth/login           # Autenticación
GET    /api/v1/auth/me              # Perfil usuario

GET    /api/v1/clientes             # Listar clientes
POST   /api/v1/clientes             # Crear cliente
GET    /api/v1/clientes/:id         # Ver cliente
PUT    /api/v1/clientes/:id         # Actualizar cliente
DELETE /api/v1/clientes/:id         # Eliminar cliente

GET    /api/v1/sedes                # Listar sedes
POST   /api/v1/sedes                # Crear sede
GET    /api/v1/sedes/:id            # Ver sede
PUT    /api/v1/sedes/:id            # Actualizar sede
DELETE /api/v1/sedes/:id            # Eliminar sede

GET    /api/v1/equipos              # Listar equipos
POST   /api/v1/equipos              # Crear equipo
GET    /api/v1/equipos/:id          # Ver equipo
PUT    /api/v1/equipos/:id          # Actualizar equipo
DELETE /api/v1/equipos/:id          # Eliminar equipo
```

### 🔄 Frontend Dashboard (En Desarrollo)
- **Sistema de Autenticación** integrado
- **Navegación Modular** con sidebar responsive
- **Gestión de Clientes** completa (CRUD)
- **Integración API** con servicios TypeScript
- **Componentes Reutilizables** con Radix UI

## 🏃‍♂️ Ejecución

### Desarrollo (con hot reload)
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Compilación en modo watch
```bash
npm run build:watch
```

## 🧪 Testing

```bash
npm test              # Ejecutar tests
npm run test:watch    # Tests en modo watch
```

## 📋 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con hot reload
- `npm run build` - Compilar TypeScript a JavaScript
- `npm run start` - Ejecutar versión compilada
- `npm test` - Ejecutar suite de tests
- `npm run lint` - Linting con ESLint
- `npm run lint:fix` - Arreglar problemas de linting automáticamente

## 🔧 Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

- `NODE_ENV` - Entorno (development/production)
- `PORT` - Puerto del servidor (default: 3000)
- `JWT_SECRET` - Clave secreta para JWT
- `DB_*` - Configuración de base de datos
- `ALLOWED_ORIGINS` - Orígenes permitidos para CORS

### Base de Datos

El proyecto soporta múltiples bases de datos. Descomenta la configuración que necesites en `.env`:

- **MySQL** - Usando mysql2
- **PostgreSQL** - Usando pg
- **MongoDB** - Usando mongoose

## 🌐 Endpoints

### Health Check
- `GET /health` - Estado del servidor

### API Base
Todos los endpoints de la API usan el prefijo `/api/v1` por defecto.

## 🚀 Migración desde PHP

Este proyecto está diseñado para migrar desde un backend PHP existente. Para comenzar la migración:

1. Analiza las rutas y endpoints de tu API PHP
2. Crea los controladores correspondientes en `src/controllers/`
3. Define los modelos de datos en `src/models/`
4. Implementa las rutas en `src/routes/`
5. Configura la base de datos en `src/config/`

## 🔐 Seguridad

- Helmet.js para headers de seguridad
- CORS configurado
- Validación de entrada con Joi
- Autenticación JWT
- Rate limiting (configurable)

## 📝 Desarrollo

1. **Agregar nuevas rutas:** Crea archivos en `src/routes/`
2. **Controladores:** Implementa la lógica en `src/controllers/`
3. **Middleware:** Agrega middleware personalizado en `src/middleware/`
4. **Modelos:** Define estructuras de datos en `src/models/`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una branch para tu feature
3. Commit tus cambios
4. Push a la branch
5. Abre un Pull Request

## 📄 Licencia

ISC License