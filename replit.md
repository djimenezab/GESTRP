# Occupational Safety Management System

## Overview

This full-stack web application provides a comprehensive Occupational Safety Management System. Its primary purpose is to help organizations efficiently manage worker information, safety equipment (EPIs), training courses, and workplace accidents. The system aims to enhance workplace safety and ensure regulatory compliance through robust data management, a professional user interface, and streamlined workflows for safety officers and administrators. Key capabilities include tracking employee safety compliance, managing equipment distribution and records, and facilitating incident reporting.

## User Preferences

Preferred communication style: Simple, everyday language (Spanish).

## System Architecture

### Frontend Architecture

The frontend is built with **React** and **TypeScript**, using **Vite** for tooling. **Wouter** manages client-side routing, and **TanStack Query (React Query)** handles server state. The UI is constructed with **shadcn/ui** components, based on Radix UI primitives, and styled with **Tailwind CSS** for a professional, Material Design-inspired theme with light/dark mode. Forms are managed using **React Hook Form** and validated with **Zod** schemas.

### Backend Architecture

The backend uses **Express.js** with **Node.js** and **TypeScript**, following a RESTful API design (`/api` prefix). It includes custom middleware for logging and error handling. A storage abstraction layer with `DbStorage` handles persistence using **Drizzle ORM** connected to a **PostgreSQL database**. UUIDs are used for primary keys, and full CRUD operations are supported for all entities. Replit Object Storage is integrated for file uploads. The system implements session-based authentication using `express-session` with `connect-pg-simple` and bcrypt for password hashing, supporting three access levels: AdminGral, Administrador, and Usuario, with role-based and zone-based data filtering.

### Data Storage Solutions

The application uses **Drizzle ORM** with **PostgreSQL** for data persistence, connected via **Neon serverless PostgreSQL**. The database schema includes tables for `trabajadores` (workers), `epis` (safety equipment), `cursos` (training courses), `accidentes` (accidents), `epis_fichas_ev` (EPI evaluation sheets catalog), `zonas_trabajo` (work zones), `usuarios` (system users with hashed passwords and access levels), and `equipos` (equipment and machinery), and `epiDocumentos` (EPI documentation). Type safety is enforced through Zod schemas generated from Drizzle schemas.

### System Design Choices

- **Comprehensive Management Modules**: Includes modules for Worker, EPI, Equipment, Training, and Accident management with full CRUD operations.
- **Role-Based Access Control**: Three access levels (AdminGral, Administrador, Usuario) with zone-based and individual user-based data filtering and creation restrictions implemented at both backend and frontend. Users can be assigned to multiple work zones.
- **File Uploads**: Integration with Replit Object Storage for documents and images (e.g., EPI documentation, equipment files, evaluation sheets, manuals).
- **Risk Evaluation Tracking**: Includes comprehensive validation and tracking for worker risk evaluation delivery with printable documents.
- **UI/UX Design**: Professional interface using Shadcn UI and Tailwind CSS, featuring searchable tables, modal dialogs, and consistent design patterns, with light/dark mode support.

## External Dependencies

### Database & ORM

- **@neondatabase/serverless**: Client for Neon serverless PostgreSQL.
- **drizzle-orm**: Type-safe ORM.
- **drizzle-kit**: CLI for schema migrations.

### UI Component Libraries

- **@radix-ui/**: Headless UI primitives.
- **lucide-react**: Icon library.
- **shadcn/ui**: Reusable UI components.
- **react-day-picker**: Date picker component.

### Data Management

- **@tanstack/react-query**: Server state management and caching.
- **react-hook-form**: Form state and validation.
- **zod**: Schema validation.
- **drizzle-zod**: Zod schema generation from Drizzle.

### Authentication & Session Management

- **express-session**: Session management middleware.
- **connect-pg-simple**: PostgreSQL session store.
- **bcrypt**: Password hashing.

### File Storage

- **Replit Object Storage (Google Cloud Storage)**: For storing documents and images.

### Utilities

- **date-fns**: Date formatting and manipulation.
- **class-variance-authority**: Type-safe component variants.
- **clsx** & **tailwind-merge**: Utilities for conditional class names.
- **nanoid**: Unique ID generation.