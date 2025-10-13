# Occupational Safety Management System

## Overview

This Occupational Safety Management System is a full-stack web application designed to help organizations manage worker information, safety equipment (EPIs), training courses, and workplace accidents. Its purpose is to provide a comprehensive solution for tracking employee safety compliance, equipment distribution, training records, and incident reporting, thereby enhancing workplace safety and regulatory adherence. The system focuses on robust data management, a professional user interface, and efficient workflows for safety officers and administrators.

## User Preferences

Preferred communication style: Simple, everyday language (Spanish).

## System Architecture

### Frontend Architecture

The frontend is built with **React** and **TypeScript**, utilizing **Vite** for tooling. **Wouter** handles client-side routing, and **TanStack Query (React Query)** manages server state. The UI leverages **shadcn/ui** components, built on Radix UI primitives, styled with **Tailwind CSS** to achieve a professional, Material Design-inspired theme with light/dark mode support. Forms are managed with **React Hook Form** and validated using **Zod** schemas. Key UI patterns include a sidebar navigation, card-based layouts, modal dialogs for CRUD operations, tabbed interfaces, and data tables with extensive filtering, sorting, and search capabilities.

### Backend Architecture

The backend uses **Express.js** with **Node.js** and **TypeScript**. It follows a RESTful API design with a `/api` prefix and includes custom middleware for logging and error handling. A storage abstraction layer (`IStorage` interface) is implemented, with `DbStorage` handling persistence using **Drizzle ORM** connected to a **PostgreSQL database**. UUIDs are used for primary keys, and full CRUD operations are supported for all entities (trabajadores, epis, cursos, accidentes).

### Data Storage Solutions

The application uses **Drizzle ORM** with **PostgreSQL** for data persistence, connected via **Neon serverless PostgreSQL**. The database schema includes core tables for:
- **trabajadores**: Worker personal information, categories, and UUID primary keys.
- **epis**: Tracks equipment deliveries, linked to workers, including equipment type, delivery date, observations, brand, model, and expiration date.
- **cursos**: Records worker training and certifications, linked to workers, storing course name, completion date, and duration.
- **accidentes**: Documents workplace incidents, linked to workers, including severity levels (LEVE, MODERADO, GRAVE), date, description, and observations.
Type safety is enforced through Zod schemas generated from Drizzle schemas, ensuring shared types across the stack.

### System Design Choices

- **Risk Evaluation Tracking**: Comprehensive validation for worker risk evaluation delivery, including fields for `recibeEvaluacionRiesgos` (boolean) and `fechaEntregaEvaluacion` (date). Implements bidirectional invariant enforcement, state-merge approach for updates, and auto-clearing logic. Includes a printable `EvaluacionRiesgosDocument`.
- **EPIs Section**: Enhanced EPI management with database fields for `marca` (brand), `modelo` (model), and `fechaCaducidad` (expiration date). Features an improved EPI form with worker selection, brand/model inputs, and an expiration date picker. Includes search, filter, and date-based sorting functionality, along with an `EpiDeliveryDocument` for formal documentation.
- **Worker Detail Dialog**: A modal dialog displaying comprehensive worker information, including associated EPIs and training courses, sorted by delivery/completion date.
- **Data Persistence**: All data is persisted in a PostgreSQL database, with `DbStorage` handling CRUD operations via Drizzle ORM. Frontend components fetch real-time data from REST API endpoints.

## External Dependencies

### Database & ORM

- **@neondatabase/serverless**: Client for Neon serverless PostgreSQL.
- **drizzle-orm**: Type-safe ORM.
- **drizzle-kit**: CLI for schema migrations.
- **ws**: WebSocket library for Neon connections.

### UI Component Libraries

- **@radix-ui/**: Headless UI primitives.
- **lucide-react**: Icon library.
- **cmdk**: Command menu component.
- **embla-carousel-react**: Carousel/slider functionality.
- **react-day-picker**: Date picker component.

### Data Management

- **@tanstack/react-query**: Server state management and caching.
- **react-hook-form**: Form state and validation.
- **zod**: Schema validation.
- **drizzle-zod**: Zod schema generation from Drizzle.

### Utilities

- **date-fns**: Date formatting and manipulation.
- **class-variance-authority**: Type-safe component variants.
- **clsx** & **tailwind-merge**: Conditional className utilities.
- **nanoid**: Unique ID generation.

### Build & Development Tools

- **vite**: Build tool and dev server.
- **tsx**: TypeScript execution for development.
- **esbuild**: Fast JavaScript bundler.
- **@replit/** plugins: Replit-specific enhancements.