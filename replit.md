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

The application uses **Drizzle ORM** with **PostgreSQL** for data persistence, connected via **Neon serverless PostgreSQL**. The database schema includes tables for `trabajadores` (workers), `epis` (safety equipment), `cursos` (training courses), `accidentes` (accidents), `epis_fichas_ev` (EPI evaluation sheets catalog), `zonas_trabajo` (work zones), `usuarios` (system users with hashed passwords and access levels), `equipos` (equipment and machinery), `epiDocumentos` (EPI documentation), and `fichas_seguridad_productos` (product safety data sheets). Type safety is enforced through Zod schemas generated from Drizzle schemas.

### System Design Choices

- **Comprehensive Management Modules**: Includes modules for Worker, EPI, Equipment, Training, Accident, and Documentation management with full CRUD operations. Documentation section includes safety data sheets with PDF upload capabilities.
- **Role-Based Access Control**: Three access levels (AdminGral, Administrador, Usuario) with zone-based and individual user-based data filtering and creation restrictions implemented at both backend and frontend. Users can be assigned to multiple work zones.
  - **Usuario Role**: View-only access to their own data (trabajador, EPIs, cursos, accidentes) and zone equipment. No creation/deletion permissions. Equipment module is read-only with document viewing capabilities only.
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

## Recent Changes

### Documentación Section (October 2025)
- Implemented **Fichas de seguridad de productos** (Product Safety Data Sheets) subsection with full CRUD operations
- Integrated **ObjectUploader** component for PDF file uploads using Replit Object Storage
- Added view and download capabilities for safety data sheets
- Uses accordion UI pattern for expandable documentation sections
- Follows same file upload pattern as Equipment section for consistency
- Fixed **apiRequest** utility to properly handle 204 No Content responses from DELETE operations
- Added **real-time search functionality** to filter safety data sheets by name, brand, or model with instant feedback
- Implemented **role-based access control**: Usuario type users can only view and download fichas (no create/edit/delete permissions)

### EPI Delivery Document Enhancement (October 2025)
- **Dynamic administrator signature**: EPI delivery documents now display the actual administrator's name who generates the document
- Added `email` field to `usuarios` table to link administrators with their worker profiles
- Created `/api/trabajador-nombre-by-email` endpoint to fetch worker names by email
- Document signature automatically shows administrator's full name from `trabajadores` table based on their email
- Falls back to "Administrador" if no matching worker is found for the email
- **Fixed**: Corrected React Query queryKey to properly pass email as query parameter to the API endpoint
- **Setup requirement**: All administrator users must have their `email` field set to match a `trabajadores.email` for the signature to work correctly

### Machinery Acceptance Report Generator (October 2025)
- **New "Generador informes" subsection** in Documentation page with machinery acceptance report functionality
- Created `informes_aceptacion_maquinaria` table to store acceptance reports (trabajadorId, equipoId, fechaAceptacion, observaciones)
- Implemented complete CRUD backend with zone-based filtering for both workers and equipment
- Built **MachineryAcceptanceDocument** component with comprehensive data-testid coverage for automated testing
- Dialog-based report generation interface with selects for worker, equipment, date, and optional observations
- **Access restrictions**: Report generator only visible to AdminGral and Administrador users (hidden from Usuario type)
- Reports automatically filtered by administrator's assigned zones for both workers and equipment
- Document includes worker details, equipment specifications, legal compliance text, obligations list (a, b, c, d), and worker signature
- **Dynamic EPIs display**: Document automatically shows equipment's mandatory EPIs as **bold centered list** under point c) when available
- Fetches EPIs from `/api/equipos/:id/epis-obligatorios` endpoint and displays them with stable test IDs (`text-epi-${id}`)
- **Removed administrator signature**: "Firmado: Administrador" text no longer appears in the document
- **Print optimizations for A4 format with adaptive content**: 
  - All dialog UI elements hidden when printing (header title, close X button, toast notifications)
  - Obligation point e) removed from document
  - **Adaptive text sizing**: Font size automatically adjusted (0.85rem) with compact line-height (1.3) to accommodate variable content
  - **Flexible spacing**: Compact margins and paddings (print:space-y-1, print:leading-tight) that adapt to content volume
  - **Dynamic scaling**: Handles variable content (multiple EPIs, long observations) while maintaining A4 format
  - **Logo sizing**: Logo reduced to `h-14` for better proportions on A4
  - **Title sizing**: Title reduced to `text-base` for compact header
  - "Atentamente," text hidden when printing (print:hidden)
  - Separator margin minimized to reduce blank space after obligations (print:my-0.5)
  - Page break control with `page-break-inside: avoid` to prevent splitting across pages
  - CSS @page rules configured for A4 size with 1cm-1.5cm margins
  - Max-height constraint (29.7cm) ensures content stays within A4 bounds
- Print-friendly document layout that automatically adapts to content volume while maintaining A4 format
- All document elements tagged with data-testid attributes for comprehensive test automation