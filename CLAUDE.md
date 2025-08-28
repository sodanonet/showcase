# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a showcase repository containing multiple project examples demonstrating different technologies. The main working project is located in the `express/` directory.

## Express.js Project Commands

The primary project is a TypeScript Express.js API with MongoDB, located in `express/`:

```bash
cd express
```

### Development Commands
- `npm run dev` - Start development server with hot-reloading (ts-node-dev)
- `npm run build` - Compile TypeScript to JavaScript in `dist/`
- `npm start` - Run production build from `dist/server.js`
- `npm test` - Run Jest test suite
- `npm run lint` - Run ESLint on TypeScript files
- `npm run seed` - Populate database with seed data

### Docker Commands
- `docker-compose up --build` - Build and start API + MongoDB containers
- `docker-compose down -v` - Stop containers and remove volumes

## Architecture Overview

### Express API Structure
- **Entry Point**: `src/server.ts` - Starts the Express server
- **App Configuration**: `src/app.ts` - Express app setup with middleware and routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth with bcrypt password hashing
- **API Documentation**: Swagger/OpenAPI via swagger-jsdoc and swagger-ui-express

### Core Directories
- `src/config/` - Environment variables, database connection, Swagger setup
- `src/controllers/` - Request handlers for auth and tasks
- `src/middleware/` - Auth, error handling, logging, and validation middleware
- `src/models/` - Mongoose schemas for User and Task entities
- `src/routes/` - Express route definitions
- `src/utils/` - JWT and password utility functions
- `src/seed/` - Database seeding scripts and data
- `src/tests/` - Jest test files

### API Endpoints
Base URL: `http://localhost:5000/api`
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /tasks` - List user tasks (authenticated)
- `POST /tasks` - Create new task (authenticated)

### Environment Configuration
Required environment variables:
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret

### Data Models
- **User**: username, email, password (hashed), role (user/admin)
- **Task**: title, description, status (pending/in-progress/completed), userId reference

## Development Notes

- TypeScript compilation target: ES2020, CommonJS modules
- Uses ts-node-dev for development hot-reloading
- MongoDB connection handled in `src/config/db.ts`
- JWT tokens expire in 1 hour
- Swagger documentation available at `/api-docs` when running
- Error handling middleware catches and formats all API errors
- All passwords are hashed using bcryptjs before storage