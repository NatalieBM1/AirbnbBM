# AIRBNBBM - AirBnB Clone

Un clon de AirBnB construido con **React (frontend) + Node/Express (backend)** siguiendo una arquitectura monorepo moderna.

## 🏗️ Estructura del Proyecto

```
AIRBNBBM/
├─ backend/
│  ├─ controllers/           # Lógica de negocio
│  │  ├─ authController.js
│  │  ├─ bookingController.js
│  │  ├─ notificationController.js
│  │  ├─ paymentController.js
│  │  └─ propertyController.js
│  ├─ routes/               # Definición de rutas
│  │  ├─ authRoutes.js
│  │  ├─ bookingRoutes.js
│  │  ├─ notificationRoutes.js
│  │  ├─ paymentRoutes.js
│  │  └─ propertyRoutes.js
│  ├─ middleware/           # Middleware personalizado
│  │  └─ authMiddleware.js
│  ├─ server.js            # Configuración principal del servidor
│  ├─ .env                 # Variables de entorno
│  └─ package.json         # Dependencias del backend
│
├─ frontend/
│  ├─ public/
│  │  └─ index.html
│  ├─ src/
│  │  ├─ components/       # Componentes reutilizables
│  │  │  ├─ Navbar.jsx
│  │  │  ├─ PropertyCard.jsx
│  │  │  └─ FilterBar.jsx
│  │  ├─ context/         # Context API
│  │  │  └─ AuthContext.js
│  │  ├─ pages/           # Páginas principales
│  │  │  ├─ Home.jsx
│  │  │  ├─ PropertyDetail.jsx
│  │  │  ├─ Booking.jsx
│  │  │  ├─ Notifications.jsx
│  │  │  ├─ Payment.jsx
│  │  │  ├─ Login.jsx
│  │  │  └─ Register.jsx
│  │  ├─ services/        # Servicios API
│  │  │  └─ api.js
│  │  ├─ styles/          # Estilos CSS
│  │  │  └─ airbnb.css
│  │  ├─ App.js           # Componente raíz
│  │  └─ index.js         # Punto de entrada
│  ├─ .env                # Variables de entorno del frontend
│  └─ package.json        # Dependencias del frontend
│
└─ README.md               # Este archivo
```

## ⚡ Inicio Rápido

### Prerrequisitos
- Node.js 16+ instalado
- npm o yarn

### Instalación

1. **Instalar dependencias del backend:**
```bash
cd backend
npm install
```

2. **Instalar dependencias del frontend:**
```bash
cd ../frontend
npm install
```

3. **Configurar variables de entorno:**

Backend (`.env`):
```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Frontend (`.env`):
```env
REACT_APP_API_BASE=http://127.0.0.1:4000/api
```

### Ejecutar el Proyecto

**Opción 1: Ejecutar ambos servicios por separado**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

**Opción 2: Con concurrently (recomendado)**
```bash
# Desde la raíz del proyecto
npm install concurrently
npm run dev
```

## 🚀 Características

### 🏠 **Frontend (React)**
- **Navbar estilo AirBnB** con búsqueda, logo y menú de usuario
- **Grid de propiedades** con cards que imitan el diseño de AirBnB  
- **Filtros interactivos** por tipo de propiedad, precio, huéspedes y amenidades
- **Vista detallada de propiedades** con galería de imágenes y información completa
- **Sistema de reservas** con cálculo automático de precios
- **Autenticación completa** (login/registro)
- **Notificaciones en tiempo real**
- **Procesamiento de pagos** (simulado)
- **Diseño responsive** optimizado para móviles

### ⚙️ **Backend (Node.js + Express)**
- **API REST completa** con endpoints organizados por funcionalidad
- **Autenticación JWT** con middleware de protección
- **Controladores separados** para mejor organización del código
- **Sistema de rutas modular** 
- **Middleware de autenticación** reutilizable
- **CORS configurado** para desarrollo y producción
- **Manejo de errores centralizado**

## 🛠️ Tecnologías Utilizadas

**Frontend:**
- React 18+ con Hooks
- React Router Dom para navegación
- Axios para peticiones HTTP
- Context API para manejo de estado
- CSS personalizado inspirado en AirBnB

**Backend:**
- Node.js + Express
- JWT para autenticación
- CORS para manejo de peticiones cross-origin
- Dotenv para variables de entorno
- Arquitectura MVC (Modelo-Vista-Controlador)

## 📡 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión  
- `GET /api/auth/me` - Perfil del usuario actual

### Propiedades
- `GET /api/properties` - Listar propiedades
- `GET /api/properties/:id` - Obtener propiedad específica
- `POST /api/properties` - Crear nueva propiedad (requiere auth)

### Reservas
- `GET /api/bookings` - Mis reservas (requiere auth)
- `POST /api/bookings` - Crear reserva (requiere auth)
- `PATCH /api/bookings/:id/cancel` - Cancelar reserva (requiere auth)

### Notificaciones
- `GET /api/notifications` - Mis notificaciones (requiere auth)
- `PATCH /api/notifications/:id/read` - Marcar como leída (requiere auth)

### Pagos
- `POST /api/payments` - Procesar pago (requiere auth)
- `GET /api/payments/booking/:bookingId` - Pagos de una reserva (requiere auth)

### Salud del Sistema
- `GET /health` - Estado del servidor

## 🎨 Diseño

El diseño está inspirado en AirBnB con:
- **Paleta de colores** moderna y minimalista
- **Tipografía** limpia y legible
- **Componentes reutilizables** con hover effects
- **Grid responsive** que se adapta a diferentes pantallas
- **Animaciones suaves** en transiciones
- **Iconos consistentes** para mejor UX

## 🔐 Autenticación

Sistema completo de autenticación que incluye:
- Registro con validación de campos
- Login con credenciales
- Protección de rutas mediante JWT
- Context API para estado global de autenticación
- Persistencia de sesión en localStorage

## 🧪 Datos de Prueba

**Usuario de prueba:**
- Email: `john@example.com`
- Password: `hashedpassword`

**Propiedades de muestra:**
- Villa en Malibu (California)
- Cabaña en Aspen (Colorado)
- Loft en Nueva York

## 📱 Páginas Principales

1. **Home** - Grid de propiedades con filtros
2. **Property Detail** - Vista detallada con galería e información
3. **Login/Register** - Autenticación de usuarios
4. **Booking** - Proceso de reserva con cálculo de precios
5. **Payment** - Procesamiento de pagos (simulado)
6. **Notifications** - Centro de notificaciones del usuario

## 🚀 Scripts Disponibles

**Backend:**
- `npm run dev` - Servidor en modo desarrollo con nodemon
- `npm start` - Servidor en modo producción

**Frontend:**  
- `npm run dev` - Aplicación React en modo desarrollo
- `npm run build` - Build optimizado para producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Desarrollado con ❤️ para aprender desarrollo full-stack moderno**