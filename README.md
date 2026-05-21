# Pente

Full-stack Pente project structured for an Angular frontend, Spring Boot backend, and one Render
Docker deployment.

## Project Layout

```text
frontend/   Angular Pente UI
backend/    Spring Boot application and API
Dockerfile  Production build for Render
```

## Frontend Development

```bash
cd frontend
npm start
```

Open `http://localhost:4200/`.

## Frontend Tests

```bash
cd frontend
npm test -- --watch=false
```

## Backend Development

```bash
cd backend
mvn spring-boot:run
```

The backend serves `/api/health` locally at `http://localhost:8080/api/health`.

## Backend Tests

```bash
cd backend
mvn test
```

## Production Build

The Dockerfile builds Angular, copies the Angular production files into Spring Boot static
resources, packages the backend, and runs the Spring Boot jar.

```bash
docker build -t pente .
docker run --rm -p 8080:8080 pente
```

Open `http://localhost:8080/`.

## Render

Create a Render Web Service from this repository and choose Docker as the runtime. Render provides
`PORT`; Spring Boot reads it with `server.port=${PORT:8080}`.

## Next Backend Step

Move the Pente game state and rule validation into Spring Boot behind `/api/games`.
