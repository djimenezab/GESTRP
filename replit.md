# Occupational Safety Management System

## Overview

This full-stack web application is an Occupational Safety Management System designed to help organizations manage worker information, safety equipment (EPIs), training courses, and workplace accidents. The system aims to enhance workplace safety, ensure regulatory compliance, and streamline workflows for safety officers and administrators. Key capabilities include tracking employee safety compliance, managing equipment distribution, facilitating incident reporting, and providing comprehensive documentation management.

## User Preferences

Preferred communication style: Simple, everyday language (Spanish).

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript, using Vite for tooling and Wouter for client-side routing. TanStack Query handles server state. UI components are developed with shadcn/ui (based on Radix UI) and styled using Tailwind CSS, featuring a Material Design-inspired theme with light/dark mode. Forms are managed with React Hook Form and validated using Zod.

### Backend Architecture

The backend utilizes Express.js with Node.js and TypeScript, following a RESTful API design. It incorporates custom middleware for logging and error handling. Data persistence is managed via Drizzle ORM connected to a PostgreSQL database, abstracted through a `DbStorage` layer. UUIDs are used for primary keys, and full CRUD operations are supported across all entities. Replit Object Storage is integrated for file uploads. Authentication is session-based using `express-session` with `connect-pg-simple` and bcrypt for password hashing, supporting three access levels: AdminGral, Administrador, and Usuario, with role-based and zone-based data filtering.

### Data Storage Solutions

The application uses Drizzle ORM with PostgreSQL, specifically Neon serverless PostgreSQL, for data persistence. The database schema includes tables for workers, safety equipment (EPIs), training courses, accidents, EPI evaluation sheets, work zones, system users, equipment/machinery, EPI documentation, product safety data sheets, chemical products, machinery acceptance reports, and worker digitized documents. Type safety is enforced via Zod schemas generated from Drizzle schemas.

### System Design Choices

- **Comprehensive Management Modules**: Includes modules for Worker, EPI, Equipment, Training, Accident, and Documentation management with full CRUD operations.
- **Role-Based Access Control**: Implements three access levels (AdminGral, Administrador, Usuario) with zone-based and individual user-based data filtering and creation restrictions.
- **File Uploads**: Integrates Replit Object Storage for managing various documents and images (e.g., EPI documentation, equipment files, worker digitized files, signatures).
- **Risk Evaluation Tracking**: Includes validation and tracking for worker risk evaluation delivery with printable documents.
- **UI/UX Design**: Professional interface using Shadcn UI and Tailwind CSS, featuring searchable tables, modal dialogs, and consistent design patterns, with light/dark mode support.
- **Print-Optimized Documents**: Generates print-friendly documents (e.g., EPI delivery, machinery acceptance reports) with adaptive content and A4 formatting.
- **Digital Signature**: Features canvas-based digital signature capture for maintenance logs, uploaded to object storage.
- **Dynamic Content**: EPI delivery documents dynamically display administrator signatures, and machinery acceptance reports dynamically list mandatory EPIs.

## External Dependencies

### Database & ORM

- **@neondatabase/serverless**: Neon serverless PostgreSQL client.
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

- **Replit Object Storage (Google Cloud Storage)**: For storing documents, images, and digital signatures.

### Utilities

- **date-fns**: Date formatting and manipulation.
- **class-variance-authority**: Type-safe component variants.
- **clsx** & **tailwind-merge**: Utilities for conditional class names.
- **nanoid**: Unique ID generation.