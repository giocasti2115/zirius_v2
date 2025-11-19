# 🚂 ZIRIUS V2 - Despliegue Rápido en Railway para QA

Railway es perfecto para QA porque:
- ✅ Despliegue automático desde GitHub
- ✅ URLs públicas instantáneas
- ✅ Base de datos MySQL incluida
- ✅ SSL automático
- ✅ Gratis para proyectos de prueba

## 🚀 Pasos Rápidos:

### 1. Preparar Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar proyecto
railway link
```

### 2. Configurar Base de Datos
```bash
# Crear servicio MySQL
railway add --service mysql

# Ver variables de entorno
railway variables
```

### 3. Desplegar
```bash
# Desplegar backend
railway up --service backend

# Desplegar frontend  
railway up --service frontend
```

## 🌐 URLs Resultantes:
- **Frontend QA:** `https://zirius-frontend-qa.up.railway.app`
- **Backend QA:** `https://zirius-api-qa.up.railway.app`
- **Documentación:** `https://zirius-api-qa.up.railway.app/api-docs`

## 👥 Credenciales de Prueba:
- **Admin:** admin@memco.com / admin123
- **Técnico:** tecnico@memco.com / tecnico123
- **Cliente:** cliente@test.com / cliente123

## 📊 Ventajas para QA:
- ✅ URL permanente y pública
- ✅ Actualizaciones automáticas desde GitHub
- ✅ Logs en tiempo real
- ✅ Escalado automático
- ✅ Sin configuración de servidor