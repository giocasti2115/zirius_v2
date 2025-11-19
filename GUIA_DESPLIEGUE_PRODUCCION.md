# 🚀 ZIRIUS V2 - Guía de Despliegue en Producción

## 🌐 **OPCIONES DE DESPLIEGUE**

### **1. 🏆 VPS/Servidor Dedicado (Recomendado)**

#### **📋 Prerequisitos:**
- **Sistema:** Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM:** Mínimo 4GB (Recomendado 8GB+)
- **CPU:** 2 cores mínimo (Recomendado 4+)
- **Almacenamiento:** 50GB+ SSD
- **Red:** IP pública estática

#### **🛠️ Preparación del Servidor:**

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Instalar herramientas adicionales
sudo apt install -y git nginx certbot python3-certbot-nginx
```

#### **🚀 Despliegue Automático:**

```bash
# 1. Descargar script de despliegue
wget https://raw.githubusercontent.com/giocasti2115/zirius_v2/master/deploy.sh
chmod +x deploy.sh

# 2. Ejecutar despliegue
sudo ./deploy.sh
```

#### **⚙️ Configuración Manual:**

```bash
# 1. Clonar repositorio
git clone https://github.com/giocasti2115/zirius_v2.git
cd zirius_v2

# 2. Configurar variables de entorno
cp .env.production .env
nano .env  # Editar configuraciones

# 3. Levantar servicios
docker-compose -f docker-compose.production.yml up -d
```

---

### **2. ☁️ Servicios en la Nube**

#### **🔵 DigitalOcean (Droplet)**
- **Precio:** Desde $20/mes (4GB RAM)
- **Ventajas:** Fácil configuración, SSD rápido
- **Despliegue:** 1-click Docker + dominio personalizado

#### **🟡 AWS EC2**
- **Precio:** Desde $15/mes (t3.medium)
- **Ventajas:** Escalabilidad automática, Load Balancer
- **Extras:** RDS para MySQL, CloudFront CDN

#### **🟢 Google Cloud Platform**
- **Precio:** Desde $25/mes + créditos gratuitos
- **Ventajas:** Cloud SQL, integración completa
- **Extras:** Google Cloud Run para contenedores

#### **🔷 Azure**
- **Precio:** Desde $30/mes
- **Ventajas:** Integración con Microsoft, Active Directory
- **Extras:** Azure Database for MySQL

---

### **3. 🐳 Plataformas de Contenedores**

#### **🟣 Heroku**
```bash
# Preparar aplicación
heroku create zirius-v2-frontend
heroku create zirius-v2-backend

# Configurar base de datos
heroku addons:create jawsdb:kitefin

# Desplegar
git push heroku master
```

#### **🔴 Railway**
```bash
# Conectar repositorio GitHub
railway login
railway link
railway up
```

#### **⚫ Render**
- **Ventajas:** SSL automático, GitHub integration
- **Precio:** $7/mes por servicio
- **Base de datos:** PostgreSQL gratuita

---

## 🌍 **CONFIGURACIÓN DE DOMINIO**

### **📡 Registros DNS Necesarios:**

```dns
# Registros A
zirius.tudominio.com        A    IP_DE_TU_SERVIDOR
api.zirius.tudominio.com    A    IP_DE_TU_SERVIDOR
www.zirius.tudominio.com    A    IP_DE_TU_SERVIDOR

# Registro CNAME (opcional)
*.zirius.tudominio.com      CNAME    zirius.tudominio.com
```

### **🔒 SSL Certificados (Let's Encrypt):**

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificados
sudo certbot --nginx -d zirius.tudominio.com -d api.zirius.tudominio.com

# Renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🚀 **PASOS RÁPIDOS DE DESPLIEGUE**

### **Opción 1: VPS con Script Automático**
```bash
# 1. Contratar VPS (DigitalOcean/AWS/Vultr)
# 2. Apuntar dominio a IP del servidor
# 3. Ejecutar script de despliegue:

wget -O deploy.sh https://raw.githubusercontent.com/giocasti2115/zirius_v2/master/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

### **Opción 2: Despliegue Local con Túnel**
```bash
# Para pruebas rápidas con ngrok:
npm install -g ngrok

# Terminal 1: Levantar aplicación
docker-compose up -d

# Terminal 2: Crear túnel público
ngrok http 3000  # Para frontend
ngrok http 5000  # Para API
```

---

## 📊 **MONITOREO Y MANTENIMIENTO**

### **📈 Comandos Útiles:**
```bash
# Ver estado de servicios
docker-compose -f docker-compose.production.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.production.yml logs -f

# Reiniciar servicios
docker-compose -f docker-compose.production.yml restart

# Backup de base de datos
docker exec zirius_mysql_prod mysqldump -u root -p zirius_production > backup_$(date +%Y%m%d).sql

# Actualizar aplicación
git pull origin master
docker-compose -f docker-compose.production.yml up -d --build
```

### **🔍 Monitoreo:**
- **Logs:** `/opt/zirius_v2/logs/`
- **Base de datos:** Backups automáticos diarios
- **SSL:** Renovación automática con Let's Encrypt
- **Updates:** Notifications via webhook/email

---

## 💰 **COSTOS ESTIMADOS**

| Opción | Costo/Mes | Ventajas | Desventajas |
|--------|-----------|----------|-------------|
| **VPS Básico** | $20-30 | Control total, SSL gratis | Requiere administración |
| **VPS Premium** | $50-100 | Alto rendimiento | Más costoso |
| **Cloud (AWS/GCP)** | $30-80 | Escalabilidad | Configuración compleja |
| **Heroku** | $25-50 | Fácil despliegue | Limitaciones |
| **Vercel/Netlify** | $20-40 | Frontend rápido | Backend separado |

---

## 🎯 **RECOMENDACIÓN FINAL**

**Para ZIRIUS V2 recomiendo:**

1. **🏆 VPS en DigitalOcean** ($20/mes)
   - 4GB RAM, 2 CPU, 80GB SSD
   - IP estática, fácil configuración
   - Script de despliegue automático

2. **🌐 Dominio profesional**
   - `zirius.tuempresa.com`
   - SSL automático con Let's Encrypt

3. **📊 Monitoreo básico**
   - Logs centralizados
   - Backups automáticos
   - Notificaciones de estado

**¿Tienes preferencia por alguna opción específica?** Te ayudo a configurar el despliegue paso a paso.