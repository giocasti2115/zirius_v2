# 🎯 Credenciales de Prueba - Sistema Zirius

## ✅ ESTADO: FUNCIONANDO CORRECTAMENTE

El sistema de autenticación está operativo y las credenciales de prueba funcionan perfectamente tanto en el backend como en el frontend.

## 📋 Usuarios de Prueba Disponibles

### 👨‍💼 Administrador
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Email:** admin@zirius.com
- **Rol:** Administrador Principal
- **Permisos:** Acceso completo al sistema

### 🔧 Técnico
- **Usuario:** `tecnico1`
- **Contraseña:** `tecnico123`
- **Email:** tecnico1@zirius.com
- **Rol:** Técnico
- **Permisos:** Gestión de órdenes, visitas, equipos

### 📊 Analista
- **Usuario:** `analista1`
- **Contraseña:** `analista123`
- **Email:** analista1@zirius.com
- **Rol:** Analista
- **Permisos:** Reportes, análisis, consultas

### 👥 Coordinador
- **Usuario:** `coordinador1`
- **Contraseña:** `coordinador123`
- **Email:** coordinador1@zirius.com
- **Rol:** Coordinador
- **Permisos:** Coordinación de equipos, asignaciones

### 💼 Comercial
- **Usuario:** `comercial1`
- **Contraseña:** `comercial123`
- **Email:** comercial1@zirius.com
- **Rol:** Comercial
- **Permisos:** Gestión de clientes, cotizaciones

## 🚀 Cómo Usar las Credenciales

### Frontend (Interfaz Web)
1. **Accede al frontend:** http://localhost:3000
2. **Ve a la página de login**
3. **Usa cualquiera de las credenciales de arriba**
4. **El sistema validará y te redirigirá al dashboard**

### API (Backend Directo)
- **URL Base:** `http://localhost:3002/api/v1`
- **Endpoint Login:** `POST /auth/login`
- **Ejemplo de uso:**
```bash
curl -X POST http://localhost:3002/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"usuario":"admin","clave":"admin123"}'
```

## ✅ Pruebas Realizadas

✅ **Login API Backend:** Funcionando correctamente  
✅ **Generación de JWT Token:** Operativo  
✅ **Validación de Credenciales:** Exitosa  
✅ **Roles y Permisos:** Configurados  
✅ **Frontend Integration:** Lista para usar  

## 🔧 Características Técnicas

- **Fallback System:** Si MySQL no está disponible, usa credenciales hardcodeadas
- **JWT Tokens:** Generación automática con expiración de 7 días
- **Compatibilidad:** Funciona con la base de datos PHP existente
- **Roles:** Cada usuario tiene un rol específico asignado
- **Sesiones:** Sistema de sesiones mock para usuarios de prueba

## 🧪 Para Pruebas Rápidas

**Recomendación:** Usa las credenciales del **administrador** para pruebas iniciales:
- Usuario: `admin`
- Contraseña: `admin123`

## 📝 Notas Importantes

1. **Sistema Híbrido:** Funciona sin MySQL para desarrollo rápido
2. **Usuarios de Prueba:** Identificados con flag `isTestUser: true`
3. **Tokens JWT:** Válidos y funcionales para todas las operaciones
4. **Migración Completa:** Compatible con el sistema PHP original

## 🎉 ¡Listo para Usar!

Con estas credenciales ya puedes probar toda la funcionalidad del sistema migrado. El backend y frontend están comunicándose correctamente y el sistema de autenticación está completamente operativo.