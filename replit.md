# Occupational Safety Management System

## Overview

This is an **Occupational Safety Management System** designed to help organizations manage worker information, safety equipment (EPIs), training courses, and workplace accidents. The application provides a comprehensive solution for tracking employee safety compliance, equipment distribution, training records, and incident reporting.

The system is built as a full-stack web application with a focus on data management, professional UI, and efficient workflows for safety officers and administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- **React** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query)** for server state management and data fetching

**UI Component Library:**
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for styling with custom design system
- **Material Design-inspired** professional theme with light/dark mode support
- Custom component variants using `class-variance-authority`

**Design System:**
- Professional enterprise color palette with semantic colors (success, warning, danger)
- Custom border radius values and elevation system (hover/active states)
- Typography using Inter font family via Google Fonts
- Responsive design with mobile-first approach

**Form Handling:**
- **React Hook Form** for form state management
- **Zod** schemas for validation (integrated with Drizzle ORM)
- **@hookform/resolvers** for validation integration

**Key UI Patterns:**
- Sidebar navigation with collapsible state
- Card-based layouts for data display
- Modal dialogs for CRUD operations
- Tabbed interfaces for worker detail views
- Data tables with filtering and search capabilities

### Backend Architecture

**Server Framework:**
- **Express.js** running on Node.js
- TypeScript for type safety across the stack
- Custom middleware for request logging and error handling

**Development vs Production:**
- Development mode uses Vite middleware for HMR (Hot Module Replacement)
- Production serves pre-built static assets
- Environment-based configuration via `NODE_ENV`

**API Structure:**
- RESTful API design with `/api` prefix for all endpoints
- Storage abstraction layer with `IStorage` interface
- Currently using in-memory storage (`MemStorage`) with UUID-based identifiers
- Designed to be easily swapped with database implementation

**Storage Interface:**
- Abstract `IStorage` interface defines CRUD operations
- `MemStorage` implementation for development/testing
- Prepared for PostgreSQL integration via Drizzle ORM

### Data Storage Solutions

**Database Schema (Drizzle ORM):**

The application uses **Drizzle ORM** with **PostgreSQL** dialect for database operations:

**Core Tables:**
1. **trabajadores** (Workers)
   - Worker personal information (name, DNI, birth date, category)
   - Categories include: OFICIAL, ENCARGADO, OPERADOR M.P., PEON ESP., etc.
   - UUID primary keys with cascade deletion for related records

2. **epis** (Personal Protective Equipment)
   - Tracks equipment delivery to workers
   - Links to workers via foreign key with cascade delete
   - Records equipment type, delivery date, and observations

3. **cursos** (Training Courses)
   - Training/certification records for workers
   - Links to workers via foreign key with cascade delete
   - Stores course name, completion date, duration in hours

4. **accidentes** (Workplace Accidents)
   - Incident tracking and reporting
   - Links to workers via foreign key with cascade delete
   - Severity levels: LEVE (minor), MODERADO (moderate), GRAVE (severe)
   - Includes date, description, severity, and observations

**Database Configuration:**
- Connection via Neon serverless PostgreSQL
- WebSocket support for serverless operations
- Environment-based configuration via `DATABASE_URL`
- Migration management through `drizzle-kit`

**Type Safety:**
- Zod schemas auto-generated from Drizzle schema
- Shared types between frontend and backend via `@shared` path alias
- Insert schemas for form validation

### External Dependencies

**Database & ORM:**
- **@neondatabase/serverless** - Serverless PostgreSQL client for Neon database
- **drizzle-orm** - Type-safe ORM for database operations
- **drizzle-kit** - CLI tool for schema migrations and database management
- **ws** - WebSocket library for Neon serverless connections

**UI Component Libraries:**
- **@radix-ui/** (multiple packages) - Headless UI primitives for accessible components
- **lucide-react** - Icon library
- **cmdk** - Command menu component
- **embla-carousel-react** - Carousel/slider functionality
- **react-day-picker** - Date picker component

**Data Management:**
- **@tanstack/react-query** - Server state management and caching
- **react-hook-form** - Form state and validation
- **zod** - Schema validation library
- **drizzle-zod** - Zod schema generation from Drizzle schemas

**Utilities:**
- **date-fns** - Date formatting and manipulation
- **class-variance-authority** - Type-safe component variants
- **clsx** & **tailwind-merge** - Conditional className utilities
- **nanoid** - Unique ID generation

**Build & Development Tools:**
- **vite** - Build tool and dev server
- **tsx** - TypeScript execution for development
- **esbuild** - Fast JavaScript bundler for production builds
- **@replit/** plugins - Replit-specific development enhancements

**Session Management:**
- **connect-pg-simple** - PostgreSQL session store (configured but not yet implemented)

**Current State:**
- Storage layer is abstracted with in-memory implementation
- Database schema is defined and ready for PostgreSQL connection
- Frontend components are built with mock data placeholders
- Routes are structured but not yet implemented with database operations