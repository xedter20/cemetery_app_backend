# COMPANY STARTER KIT
```
Author: PP
Email: pp@company.com
```

## Microservices Project

This project is composed of multiple microservices, each serving a distinct purpose within the application ecosystem. The three main services are:

1. **cemetery-service**

2. **auth-service**

3. **cemetery-db-lite**

Each service is built as a standalone microservice but works together to achieve the overall system goals. Below is a description of each service and its folder structure.

---

## Project Structure

```bash
.
├── cemetery-service
├── auth-service
└── cemetery-db-lite
```

### 1. cemetery-service
The cemetery-service handles administrative functionalities within the system. This service provides endpoints for managing user roles, permissions, system configuration, and audit logs. It includes a submodule for activity logging and authorization checks.

Main Features:

- User Management (Admin roles)

- Permission Management

- Activity Logging

- Reporting and system logs access


### 2. auth-service
The auth-service is responsible for handling user authentication, token generation, and session management. This service manages user login, registration, and ensures secure access control throughout the system.

Main Features:

- User Authentication (login, logout)

- Token Management (JWT with RSA encryption)

- Redis-based session management

- User registration


### 3. cemetery-db-lite
The cemetery-db-lite service is a lightweight database service that uses H2 as an in-memory database (in PostgreSQL compatibility mode). This service handles all database-related operations for storing user data, permissions, and logs.

Main Features:

- In-memory H2 Database setup (can be persisted if required)

- Schema management for user, permission, and activity logging tables

- Web-based H2 console for database inspection


## Running the Services
**1. Admin Service**
To run the cemetery-service, navigate to the project root and run:

```
cd cemetery-service
npm install
npm run start
```

**2. Auth Service**
To run the auth-service, navigate to the project root and run:

```
cd auth-service
npm install
npm run start
```

**3. Cemetery DB Lite**
The cemetery-db-lite service is built using Spring Boot. You can run the service by navigating to the project root and running:
```
cd cemetery-db-lite
mvn clean install
mvn spring-boot:run
```
The H2 database console will be available at http://localhost:8080/h2 by default.

## Prerequisites

```
Node.js (for cemetery-service and auth-service)

Maven (for cemetery-db-lite)

Java 17 or higher for cemetery-db-lite
```

Ensure you have the necessary dependencies installed for each service before running them.


## Notes

Each service runs independently and can be deployed as separate microservices.
Communication between the services can be achieved via REST APIs. Make sure to configure proper network communication if services are deployed across different environments.

The cemetery-db-lite service is designed to handle the persistence layer, and you can change the configuration to a persistent database like PostgreSQL if needed in production environments.



This README provides a brief overview of the microservices structure, along with instructions on how to run each service. For more detailed documentation, check the specific service folder's documentation or code comments.#   c e m e t e r y _ a p p _ b a c k e n d  
 #   c e m e t e r y _ a p p _ b a c k e n d  
 