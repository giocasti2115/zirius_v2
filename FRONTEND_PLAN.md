# Plan de Migración Frontend React

## 🎯 Objetivo
Migrar el frontend PHP a React.js que se conecte con nuestro backend Node.js + Express + TypeScript.

## 📁 Estructura Propuesta del Frontend

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ChangePassword.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── ordenes/
│   │   │   ├── OrdenList.tsx
│   │   │   ├── OrdenForm.tsx
│   │   │   └── OrdenDetail.tsx
│   │   ├── sedes/
│   │   │   ├── SedeList.tsx
│   │   │   └── SedeForm.tsx
│   │   ├── equipos/
│   │   │   ├── EquipoList.tsx
│   │   │   └── EquipoForm.tsx
│   │   └── cotizaciones/
│   │       ├── CotizacionList.tsx
│   │       └── CotizacionForm.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── ordenes.ts
│   │   ├── sedes.ts
│   │   └── equipos.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── usePermissions.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── ordenes.ts
│   │   └── api.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Ordenes.tsx
│   │   ├── Sedes.tsx
│   │   └── Equipos.tsx
│   ├── App.tsx
│   ├── App.css
│   └── index.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Tecnologías a Utilizar

### Core
- **React 18** con TypeScript
- **React Router** para navegación
- **Axios** para llamadas HTTP
- **React Query/TanStack Query** para manejo de estado de servidor

### UI/UX
- **Material-UI (MUI)** o **Ant Design** para componentes
- **Styled-components** o **Emotion** para estilos
- **React Hook Form** para formularios

### Estado y Autenticación
- **Context API** para estado global
- **JWT** para autenticación
- **LocalStorage** para persistencia de token

## 🚀 Fases de Implementación

### Fase 1: Configuración Base ✅
- [x] Backend Node.js + Express + TypeScript
- [x] Sistema de autenticación JWT
- [x] Base de datos MySQL configurada
- [ ] Frontend React con TypeScript

### Fase 2: Autenticación 
- [ ] Componente de Login
- [ ] Context de autenticación
- [ ] Rutas protegidas
- [ ] Interceptores para JWT

### Fase 3: Módulos Principales
- [ ] Dashboard principal
- [ ] Gestión de órdenes de trabajo
- [ ] Gestión de sedes y clientes
- [ ] Gestión de equipos

### Fase 4: Módulos Avanzados
- [ ] Sistema de cotizaciones
- [ ] Reportes e indicadores
- [ ] Gestión de visitas
- [ ] Sistema de permisos por rol

### Fase 5: Optimización
- [ ] Lazy loading de componentes
- [ ] Optimización de bundle
- [ ] PWA capabilities
- [ ] Testing

## 🔗 Conexión Backend-Frontend

### Configuración API
```typescript
// src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api/v1';
```

### Autenticación
```typescript
// Headers automáticos para todas las requests
Authorization: `Bearer ${token}`
```

### Endpoints Principales
- `POST /auth/login` - Login
- `GET /auth/me` - Info usuario
- `POST /auth/logout` - Logout
- `GET /ordenes` - Lista de órdenes
- `POST /ordenes` - Crear orden
- `GET /sedes` - Lista de sedes

## 📋 Próximos Pasos

1. **Crear proyecto React** con TypeScript
2. **Configurar enrutamiento** y estructura base
3. **Implementar autenticación** que conecte con nuestro backend
4. **Migrar pantallas principales** del PHP a React
5. **Implementar sistema de permisos**
6. **Testing y optimización**

## 🎨 Consideraciones de Diseño

- **Responsive**: Mobile-first approach
- **Accesibilidad**: WCAG 2.1 AA compliance  
- **Tema**: Mantener colores y branding de Ziriuz
- **UX**: Mejorar la experiencia comparado con PHP

## 🔧 Variables de Entorno Frontend

```env
REACT_APP_API_URL=http://localhost:3002/api/v1
REACT_APP_APP_NAME=Ziriuz
REACT_APP_VERSION=2.0.0
```