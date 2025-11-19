# 🧪 ZIRIUS V2 - Guía Rápida para QA con ngrok

## 🚀 **CONFIGURACIÓN INICIAL (Solo una vez)**

### **Paso 1: Obtener Token de ngrok**
1. Ve a: https://ngrok.com/signup
2. Crea una cuenta gratuita
3. Ve a: https://dashboard.ngrok.com/get-started/your-authtoken
4. Copia tu token de autenticación

### **Paso 2: Configurar ngrok**
```bash
# En Windows:
setup-ngrok-qa.bat

# En Linux/Mac:
chmod +x start-qa-testing.sh
```

---

## 🎯 **LEVANTAR AMBIENTE DE QA**

### **En Windows:**
```bash
# 1. Ejecutar setup (solo primera vez)
setup-ngrok-qa.bat

# 2. Levantar ambiente QA
start-qa-testing.bat
```

### **En Linux/Mac:**
```bash
# 1. Dar permisos
chmod +x start-qa-testing.sh

# 2. Levantar ambiente QA
./start-qa-testing.sh
```

---

## 🌐 **URLs PARA QA**

Una vez ejecutado el script, obtendrás URLs como:

```
🌐 FRONTEND: https://abc123.ngrok.io
🔧 BACKEND API: https://def456.ngrok.io
📚 DOCUMENTACIÓN: https://def456.ngrok.io/api-docs
```

**✅ Estas URLs son públicas y accesibles desde cualquier lugar**

---

## 👥 **CREDENCIALES DE PRUEBA**

### **Usuario Administrador:**
- **Email:** admin@memco.com
- **Contraseña:** admin123
- **Permisos:** Acceso completo al sistema

### **Usuario Técnico:**
- **Email:** tecnico@memco.com
- **Contraseña:** tecnico123
- **Permisos:** Gestión de equipos y órdenes

### **Usuario Cliente:**
- **Email:** cliente@test.com
- **Contraseña:** cliente123
- **Permisos:** Consulta de servicios

---

## 📋 **MÓDULOS DISPONIBLES PARA PRUEBAS**

### **✅ Completamente Funcionales (144 módulos):**

#### **🏭 Administración (12 módulos)**
- ✅ Usuarios y roles
- ✅ Configuración general
- ✅ Parámetros del sistema
- ✅ Variables globales
- ✅ Permisos y seguridad
- ✅ Auditoría completa
- ✅ Respaldos automáticos
- ✅ Notificaciones
- ✅ Categorías y clasificaciones
- ✅ Estados y prioridades
- ✅ Marcas y modelos
- ✅ Tipos de equipos

#### **🔧 Operaciones (12 módulos)**
- ✅ Equipos y seguimiento GPS
- ✅ Órdenes de servicio
- ✅ Mantenimiento preventivo
- ✅ Calibraciones
- ✅ Repuestos e inventario
- ✅ Dar de baja equipos
- ✅ QR para mantenimiento
- ✅ Fotos y documentación
- ✅ Cambios y modificaciones
- ✅ Historial completo
- ✅ Estados en tiempo real
- ✅ Mapas y ubicaciones

#### **👥 Clientes (12 módulos)**
- ✅ Gestión de clientes
- ✅ Contactos y comunicación
- ✅ Sedes y ubicaciones
- ✅ Contratos y servicios
- ✅ Historial de servicios
- ✅ Solicitudes de servicio
- ✅ Seguimiento de visitas
- ✅ Documentación técnica
- ✅ Facturación integrada
- ✅ Portal de cliente
- ✅ Notificaciones automáticas
- ✅ Reportes personalizados

#### **📊 Reportes y Analytics (12 módulos)**
- ✅ Dashboard en tiempo real
- ✅ Indicadores de rendimiento
- ✅ Reportes de equipos
- ✅ Análisis de fallos
- ✅ Duración de repuestos
- ✅ Correctivos por equipo
- ✅ Estadísticas de servicio
- ✅ Gráficos interactivos
- ✅ Exportación múltiple
- ✅ Programación automática
- ✅ Alertas y tendencias
- ✅ Métricas de calidad

#### **📱 Funcionalidades Avanzadas**
- ✅ Sistema QR completo
- ✅ GPS tracking en tiempo real
- ✅ Galería de fotos
- ✅ Mapas interactivos
- ✅ Check-in/Check-out
- ✅ Notificaciones push
- ✅ API REST completa
- ✅ Documentación Swagger
- ✅ Autenticación JWT
- ✅ Roles y permisos

---

## 🧪 **CASOS DE PRUEBA SUGERIDOS**

### **Pruebas Básicas:**
1. 🔐 Login con diferentes usuarios
2. 📊 Navegación por todos los módulos
3. ➕ Crear, editar y eliminar registros
4. 🔍 Búsquedas y filtros
5. 📱 Responsividad mobile

### **Pruebas Avanzadas:**
1. 📸 Subida de fotos y documentos
2. 📍 Funcionalidades GPS y mapas
3. 📱 Generación y lectura de códigos QR
4. 📊 Generación de reportes
5. 🔄 Sincronización en tiempo real

### **Pruebas de Integración:**
1. 🔄 Flujo completo de órdenes de servicio
2. 👥 Asignación de técnicos a visitas
3. 📋 Solicitudes de bodega
4. 💰 Proceso de cotizaciones
5. 📈 Dashboard con datos reales

---

## 🛠️ **COMANDOS ÚTILES**

### **Ver Logs:**
```bash
docker-compose logs -f
```

### **Reiniciar Servicios:**
```bash
docker-compose restart
```

### **Estado de Servicios:**
```bash
docker-compose ps
```

### **Parar Todo:**
```bash
# Windows: Ctrl+C en la ventana del script
# Linux/Mac: Ctrl+C en terminal
```

---

## 📞 **SOPORTE TÉCNICO**

- **🐛 Reportar bugs:** Crear issue en GitHub
- **❓ Preguntas:** Contactar al equipo de desarrollo
- **📚 Documentación:** /api-docs en la URL del backend
- **🔍 Logs:** Disponibles en tiempo real

---

## ✅ **CHECKLIST PARA QA**

### **Funcionalidades Core:**
- [ ] Login y autenticación
- [ ] Navegación entre módulos
- [ ] CRUD básico en todas las secciones
- [ ] Búsquedas y filtros
- [ ] Paginación
- [ ] Validaciones de formularios
- [ ] Mensajes de error/éxito

### **Funcionalidades Avanzadas:**
- [ ] Dashboard con gráficos
- [ ] Subida de archivos/fotos
- [ ] Generación de QR
- [ ] Mapas y GPS
- [ ] Reportes y exportación
- [ ] Notificaciones
- [ ] Responsividad mobile

### **Performance:**
- [ ] Carga inicial rápida
- [ ] Navegación fluida
- [ ] Manejo de grandes datasets
- [ ] Optimización mobile

**🎉 ¡ZIRIUS V2 listo para pruebas exhaustivas de QA!**