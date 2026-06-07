# 🎨 Talento Sin Frontera

Plataforma colaborativa para talentos artísticos de Latinoamérica — donde creadores, estudiantes y profesionales se conectan para compartir, aprender y crecer.

## 🚀 Demo en Producción

| Servicio | URL |
|---|---|
| Frontend | https://talento-sin-frontera.vercel.app |
| Backend API | https://tsf-api.onrender.com |
| Swagger Docs | https://tsf-api.onrender.com/api-docs |

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────┐     HTTP/WS     ┌──────────────────┐
│  React 18 SPA    │ ─────────────── │  Express API     │
│  (Vercel)        │                 │  + Socket.IO     │
└──────────────────┘                 │  (Render)        │
                                     └────────┬─────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              │               │               │
                    ┌─────────▼──────┐  ┌─────▼──────┐  ┌────▼────────┐
                    │  PostgreSQL 15 │  │ Cloudinary │  │  Nodemailer │
                    │  (Railway)     │  │  (Media)   │  │   (SMTP)    │
                    └────────────────┘  └────────────┘  └─────────────┘
```

## 🛠️ Tecnologías

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React | 18.3 |
| Backend | Node.js + Express | 20 / 4.18 |
| Base de datos | PostgreSQL + Sequelize | 15 / 6.37 |
| Auth | JWT (jsonwebtoken) | 9.0 |
| Real-time | Socket.IO | 4.7 |
| Multimedia | Cloudinary | 1.41 |
| Testing | Jest + Playwright | 29 / 1.44 |
| CI/CD | GitHub Actions | — |
| Deploy | Vercel + Render | — |

---

## ⚡ Ejecución Local (sin Docker)

### Prerrequisitos
- Node.js 20+
- PostgreSQL 15+
- Cuenta Cloudinary (gratis)

### 1. Clonar el repositorio
```bash
git clone https://github.com/talento-sin-frontera/tsf-platform.git
cd tsf-platform
```

### 2. Configurar variables de entorno
```bash
# Backend
cp server/.env.example server/.env
# Editar server/.env con tus credenciales

# Frontend
cp client/.env.example client/.env
```

### 3. Instalar dependencias
```bash
npm run install:all
```

### 4. Crear la base de datos
```bash
psql -U postgres -c "CREATE DATABASE talento_sin_frontera;"
```

### 5. Iniciar el proyecto
```bash
npm run dev   # Inicia backend (port 5000) y frontend (port 3000) simultáneamente
```

---

## 🐳 Ejecución con Docker (solo aprendizaje)

```bash
# Copiar variables de entorno
cp server/.env.example .env

# Levantar todos los servicios
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

---

## 🧪 Ejecutar Pruebas

```bash
# Pruebas unitarias + integración (backend)
cd server && npm test

# Con reporte de coverage
cd server && npm test -- --coverage

# Pruebas E2E (Playwright)
cd client && npx playwright test

# Ver reporte visual de E2E
cd client && npx playwright show-report
```

---

## 📁 Estructura del Proyecto

```
tsf-platform/
├── client/                    # React 18 SPA
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── ui/            # Button, Input, Card, Avatar...
│   │   │   └── layout/        # Navbar
│   │   ├── pages/             # Login, Register, Explore, ProjectDetail...
│   │   ├── context/           # AuthContext, SocketContext
│   │   └── utils/             # Axios instance (api.js)
│   ├── e2e/                   # Pruebas Playwright E2E
│   └── playwright.config.js
├── server/                    # Node.js + Express API
│   ├── controllers/           # Lógica de negocio por entidad
│   ├── models/                # Modelos Sequelize
│   ├── routes/                # Endpoints REST
│   ├── middleware/            # Auth JWT, Upload, ErrorHandler
│   ├── config/                # Database, Cloudinary, Mailer
│   └── __tests__/             # Jest tests
├── .github/workflows/         # CI/CD GitHub Actions
├── Dockerfile                 # Docker image del backend
├── docker-compose.yml         # Orquestación local completa
└── README.md
```

---

## 🔑 Variables de Entorno

### Server (`server/.env`)

| Variable | Descripción | Requerida |
|---|---|---|
| `PORT` | Puerto del servidor | No (default: 5000) |
| `DB_HOST` | Host PostgreSQL | ✅ |
| `DB_NAME` | Nombre de la BD | ✅ |
| `DB_USER` | Usuario PostgreSQL | ✅ |
| `DB_PASSWORD` | Contraseña PostgreSQL | ✅ |
| `JWT_SECRET` | Clave secreta JWT (mín. 32 chars) | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary | ✅ |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | ✅ |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | ✅ |
| `MAIL_USER` | Correo SMTP | No |
| `MAIL_PASS` | Contraseña de app SMTP | No |
| `CLIENT_URL` | URL del frontend (CORS) | ✅ |

---

## 👥 Equipo

- **Zharick Vanessa Perdomo Ortega**
- **Angela Vanessa Zamora Cuan**
- **Ángel Santiago Zarta Sarmiento**

Corporación Universitaria Iberoamericana · Proyecto de Software · 2026
