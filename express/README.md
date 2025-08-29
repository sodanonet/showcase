# Enhanced Express.js API Server

A comprehensive, production-ready Express.js backend API with TypeScript, MongoDB, JWT authentication, advanced security, analytics, and comprehensive documentation.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - User, Admin, and Moderator roles
- **Password Security** - bcrypt hashing with configurable rounds
- **Rate Limiting** - Comprehensive rate limiting for different endpoints

### 📊 Analytics & Reporting
- **Task Analytics** - Detailed task completion metrics and trends
- **User Analytics** - User activity and productivity insights
- **Data Export** - CSV/JSON export functionality
- **Real-time Dashboard** - Overview statistics and KPIs

### 🛡️ Security Features
- **Security Headers** - Comprehensive HTTP security headers
- **Request Validation** - Input sanitization and validation
- **XSS Protection** - Cross-site scripting prevention
- **SQL Injection Protection** - Pattern-based SQL injection detection
- **Rate Limiting** - Multiple rate limiting strategies
- **IP Filtering** - Whitelist/blacklist functionality
- **Request Size Limits** - Protection against oversized payloads

### 📝 API Documentation
- **Swagger/OpenAPI** - Interactive API documentation
- **Type Safety** - Full TypeScript integration
- **Request/Response Examples** - Comprehensive API examples
- **Auto-generated Docs** - Documentation from code annotations

### 🗄️ Database Features
- **MongoDB Integration** - Mongoose ODM with validation
- **Data Relationships** - User-Task relationships with population
- **Indexes** - Optimized database queries
- **Validation** - Schema-level data validation
- **Aggregation** - Complex data aggregation pipelines

## 🛠️ Tech Stack

- Node.js
- Express.js
- TypeScript
- dotenv
- (Optional) Swagger, Jest, Docker

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- npm or yarn

### Installation

```bash
git clone https://github.com/sodanonet/showcase.git
cd showcase/express
npm install
```

### Running the Server

```bash
npm run dev
```

Server will start on http://localhost:5000 by default.

### Building for Production

```bash
npm run build
npm start
```

## 🧪 Testing

```bash
npm test
```

## 📁 Project Structure

```
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── seed/
├── tests/
├── utils/
├── app.ts
├── server.ts

```

## 🔐 Environment Variables

```
PORT=5000
MONGO_URI=your_database_url
JWT_SECRET=your_jwt_secret
```

## 📡 API Endpoints

Base url [http://localhost:5000/api](http://localhost:5000/api)

### 🔐 Auth

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | `/auth/login`    | Authenticate user       |
| POST   | `/auth/register` | Create new user account |

### 📦 Tasks

| Method | Endpoint | Description       |
| ------ | -------- | ----------------- |
| GET    | `/tasks` | List all tasks    |
| POST   | `/tasks` | Create a new task |

## 🌱 Seed Data

### Seeding the Database

To populate the database with initial data, run the seed script:

```bash
npm run seed
```

You can organize seed files by entity:

```
src/
├── seed/
│   ├── tasks.seed.ts
│   ├── users.seed.ts
│   └── index.ts
```

## 🐳 Docker Setup

### 🐳 Running the Project with Docker

This project includes a `docker-compose.yml` file that sets up:

- **Express API** container (`express_api`)
- **MongoDB** container (`express_mongodb`)
- (Optional) **Swagger UI** served from `/api-docs` via Express

#### 📦 Build and Start Containers

```bash
docker-compose up --build
```

This will:

Build the Express app

Start MongoDB on port 27018 (mapped to container’s 27017)

Launch the API on port 5000

### 🔁 Rebuild Containers

```bash
docker-compose down
docker-compose up --build
```

### 🧪 Access Services

API: http://localhost:5000

Swagger UI: http://localhost:5000/api-docs

MongoDB: accessible at mongodb://localhost:27018 (host) or mongodb://mongo:27017 (inside Docker)

### 🛠️ Environment Configuration

Make sure your .env file includes:

```
PORT=5000
MONGO_URI=mongodb://mongo:27017/devboard
```

**Note:** Inside Docker, services communicate using their container names (e.g. mongo), not localhost.

### 🧹 Stop and Clean Up

```bash
docker-compose down -v
```

This stops all containers and removes volumes.
