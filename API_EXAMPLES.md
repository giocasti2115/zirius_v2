# Ziriuz API - Ejemplos de uso

## 🚀 Configuración inicial

1. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

2. **Editar el archivo .env:**
   - Configurar la conexión a MySQL con tu base de datos `ziriuzco_ziriuz`
   - Cambiar `JWT_SECRET` por una clave segura

3. **Instalar dependencias y ejecutar:**
   ```bash
   npm install
   npm run dev
   ```

## 📡 Endpoints disponibles

### Autenticación

**Base URL:** `http://localhost:3000/api/v1/auth`

#### Login
```http
POST /login
Content-Type: application/json

{
  "usuario": "tu_usuario",
  "clave": "tu_contraseña"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": 123,
    "user": {
      "id": 1,
      "usuario": "admin",
      "nombre": "Administrador",
      "email": "admin@example.com",
      "roles": ["admin"]
    }
  },
  "message": "Login exitoso"
}
```

#### Obtener información del usuario
```http
GET /me
Authorization: Bearer tu_token_jwt
```

#### Cambiar contraseña
```http
POST /change-password
Authorization: Bearer tu_token_jwt
Content-Type: application/json

{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña",
  "confirmPassword": "nueva_contraseña"
}
```

#### Logout
```http
POST /logout
Authorization: Bearer tu_token_jwt
```

#### Renovar token
```http
POST /refresh-token
Authorization: Bearer tu_token_jwt
```

## 🔧 Pruebas con curl

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"tu_usuario","clave":"tu_contraseña"}'
```

### Obtener info del usuario (reemplaza TOKEN con el token recibido)
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 🔐 Sistema de permisos

El sistema mantiene la misma estructura de roles que el PHP original:

- **admin**: Acceso total al sistema
- **tecnico**: Gestión de órdenes y equipos
- **analista**: Reportes y análisis
- **coordinador**: Coordinación de técnicos
- **comercial**: Gestión comercial y cotizaciones

## 📊 Health Check

```http
GET /health
```

Verifica que el servidor esté funcionando correctamente.

## 🚨 Errores comunes

### Error de conexión a base de datos
- Verificar que MySQL esté ejecutándose
- Verificar credenciales en `.env`
- Verificar que la base de datos `ziriuzco_ziriuz` exista

### Token inválido
- El token tiene una expiración de 7 días por defecto
- Usar `/refresh-token` para renovar
- Verificar que el header `Authorization` tenga el formato: `Bearer token`

## 🔄 Migración desde PHP

### Compatibilidad
- ✅ **Usuarios**: Login funciona con credenciales existentes
- ✅ **Sesiones**: Se crean en la tabla `sesiones` como el PHP
- ✅ **Permisos**: Se respetan los roles y permisos existentes
- ✅ **Base de datos**: Usa la misma estructura que el PHP

### Próximos endpoints a implementar
- [ ] Gestión de órdenes de trabajo
- [ ] Gestión de sedes y clientes
- [ ] Sistema de cotizaciones
- [ ] Gestión de equipos
- [ ] Reportes e indicadores
- [ ] Sistema de visitas

## 📝 Notas importantes

1. **Contraseñas**: El sistema migrará gradualmente de contraseñas en texto plano a hash bcrypt
2. **Sesiones**: Se mantiene compatibilidad con el sistema PHP existente
3. **JWT**: Se añade autenticación JWT para APIs modernas
4. **CORS**: Configurado para permitir conexión desde tu frontend React