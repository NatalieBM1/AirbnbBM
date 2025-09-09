Estructura del Proyecto Airbnb Clone:

/airbnb-clone
│── /frontend
│   ├── /public
│   │    └── index.html
│   ├── /src
│   │    ├── index.js
│   │    ├── App.js
│   │    ├── main.jsx
│   │
│   ├── /assets              → imágenes, íconos, logos
│   ├── /components          → Navbar, Footer, Cards, Forms, Map, Filters
│   ├── /pages               → páginas según requerimientos y responsables
│   │    ├── Register.jsx          → (Natalie) Registro de anfitriones/viajeros
│   │    ├── Login.jsx             → (Natalie) Inicio de sesión (email/social)
│   │    ├── Home.jsx              → (Víctor) Búsqueda + mapa interactivo + filtros
│   │    ├── PropertyDetail.jsx    → (Santiago) Detalle de alojamiento
│   │    ├── Booking.jsx           → (Samuel) Selección de fechas + reservas
│   │    ├── Payment.jsx           → (Natalie) Pasarela de pagos
│   │    └── Notifications.jsx     → (Juan) Notificaciones de usuarios/anfitriones
│   │
│   ├── /services           → funciones para consumir APIs externas (ej: getProperties, makeBooking, processPayment)
│   ├── /context            → manejo global de estado (ej: AuthContext.js)
│   └── /styles             → tailwind.config.js, estilos globales
│
│── /backend
│   ├── server.js           → archivo principal para levantar el servidor con Express
│   ├── .env                → configuración (API_KEY, API_URL, PORT)
│   │
│   ├── /controllers        → lógica de negocio conectada a APIs externas
│   │    ├── authController.js       → (Natalie) Registro/Login
│   │    ├── propertyController.js  → (Víctor/Santiago) Propiedades y detalle
│   │    ├── bookingController.js   → (Samuel) Reservas
│   │    ├── paymentController.js   → (Natalie) Pagos
│   │    └── notificationController.js → (Juan) Notificaciones
│   │
│   ├── /routes             → definición de endpoints
│   │    ├── authRoutes.js
│   │    ├── propertyRoutes.js
│   │    ├── bookingRoutes.js
│   │    ├── paymentRoutes.js
│   │    └── notificationRoutes.js
│   │
│   └── /middleware         → autenticación y validaciones
│        └── authMiddleware.js
│
│── README.md               → documentación del proyecto
# AirbnbBM