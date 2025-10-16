# Occupational Safety Management System

## Overview

This full-stack web application provides a comprehensive Occupational Safety Management System. Its primary purpose is to help organizations efficiently manage worker information, safety equipment (EPIs), training courses, and workplace accidents. The system aims to enhance workplace safety and ensure regulatory compliance through robust data management, a professional user interface, and streamlined workflows for safety officers and administrators. Key capabilities include tracking employee safety compliance, managing equipment distribution and records, and facilitating incident reporting.

## User Preferences

Preferred communication style: Simple, everyday language (Spanish).

## System Architecture

### Frontend Architecture

The frontend is built with **React** and **TypeScript**, using **Vite** for tooling. **Wouter** manages client-side routing, and **TanStack Query (React Query)** handles server state. The UI is constructed with **shadcn/ui** components, based on Radix UI primitives, and styled with **Tailwind CSS** for a professional, Material Design-inspired theme with light/dark mode. Forms are managed using **React Hook Form** and validated with **Zod** schemas. The UI features a sidebar navigation, card-based layouts, modal dialogs for CRUD operations, tabbed interfaces, and data tables with filtering, sorting, and search functionalities.

### Backend Architecture

The backend uses **Express.js** with **Node.js** and **TypeScript**, following a RESTful API design (`/api` prefix). It includes custom middleware for logging and error handling. A storage abstraction layer with `DbStorage` handles persistence using **Drizzle ORM** connected to a **PostgreSQL database**. UUIDs are used for primary keys, and full CRUD operations are supported for all entities (workers, EPIs, courses, accidents). Replit Object Storage is integrated for file uploads (e.g., equipment images, evaluation sheets, manuals, EPI documentation).

### Data Storage Solutions

The application uses **Drizzle ORM** with **PostgreSQL** for data persistence, connected via **Neon serverless PostgreSQL**. The database schema includes tables for:
- **trabajadores**: Worker personal information and categories.
- **epis**: Tracks safety equipment deliveries, linked to workers, including type, delivery date, brand, model, and expiration.
- **cursos**: Records worker training and certifications.
- **accidentes**: Documents workplace incidents, including severity, type, date, time, and location.
- **epis_fichas_ev**: Manages a catalog of EPI names for evaluation sheets.
- **zonas_trabajo**: Manages work zones that can be assigned to workers and equipment.
- **usuarios**: System users with hashed passwords and three access levels (AdminGral, Administrador, Usuario).
- **equipos**: Manages equipment and machinery with associated files and mandatory EPIs.
- **epiDocumentos**: Tracks uploaded documentation for EPIs.
Type safety is enforced through Zod schemas generated from Drizzle schemas.

### System Design Choices

- **Worker Management**: Comprehensive worker information, categories, and detail views.
- **EPI Management**: Tracking of equipment deliveries with detailed information (brand, model, expiration), document uploads via Replit Object Storage, and automatic correlative numbering for EPIs. Includes a separate catalog for EPI names used in evaluation sheets.
- **Equipment Management**: CRUD operations for equipment and machinery, including file uploads for images, evaluation sheets, and manuals, and multi-selection of mandatory EPIs from the catalog.
- **Training Management**: Recording and tracking of worker training courses and certifications.
- **Accident Management**: Detailed logging of workplace incidents, including severity levels, type, location, and reporting personnel. Includes enhanced form fields and display.
- **Risk Evaluation Tracking**: Comprehensive validation and tracking for worker risk evaluation delivery, including a printable document.
- **Core CRUD Operations**: Full Create, Read, Update, Delete functionality across all main entities.
- **File Uploads**: Integration with Replit Object Storage for storing documents and images (e.g., EPI documentation, equipment files) with public access.
- **UI/UX Design**: Professional interface using Shadcn UI, Tailwind CSS, with features like searchable tables, modal dialogs for data entry, and consistent design patterns.

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

### File Storage

- **Replit Object Storage (Google Cloud Storage)**: For storing documents and images.

### Utilities

- **date-fns**: Date formatting and manipulation.
- **class-variance-authority**: Type-safe component variants.
- **clsx** & **tailwind-merge**: Utilities for conditional class names.
- **nanoid**: Unique ID generation.

## Recent Changes

### October 16, 2025 (Latest)
- **Zone-Based Data Filtering Implementation**:
  - **Backend Filtering**: Implemented zone-based filtering for all data endpoints
  - **Storage Layer**: Added filtered query methods (getTrabajadoresByZonas, getEpisByZonas, getCursosByZonas, getAccidentesByZonas, getEquiposByZonas)
  - **Route Logic**: 
    - AdminGral: sees all data (no filtering)
    - Administrador: sees only data from assigned zonasIds
    - Usuario: planned to see only own data (currently returns empty arrays)
  - **Filtering Strategy**:
    - Trabajadores & Equipos: Direct filter by zonaId field
    - EPIs, Cursos & Accidentes: Indirect filter via trabajadorId (workers in assigned zones)
  - **Validation**: Tested with Administrador user with 2 zones, correctly filtered to show 1/5 workers and 1/2 equipment items
  - **Pending**: Usuario role filtering implementation

- **Multiple Zones per User**:
  - Updated users table to support multiple zones (zonasIds array field)
  - Changed from single zone (zonaId) to multiple zones (zonasIds varchar[])
  - Database migration: Converted existing zonaId values to arrays preserving data
  - Updated forms in Configuración to use checkboxes for multi-zone selection
  - Users table displays comma-separated zone names
  - Updated AuthContext and session management for multiple zones
  - Form validation supports optional array of zone IDs

- **Authentication & Authorization System**:
  - Implemented complete session-based authentication using express-session
  - Users can be assigned to multiple work zones for flexible access control
  - Three access levels: AdminGral (full access), Administrador (filtered by zonas), Usuario (own data only)
  - **Session Management**:
    - SESSION_SECRET stored in Replit secrets
    - express-session with connect-pg-simple for PostgreSQL session store
    - Session persistence across page refreshes
  - **Authentication Routes**:
    - POST /api/auth/login - Login with username/password
    - POST /api/auth/logout - Logout and destroy session
    - GET /api/auth/session - Check current session status
    - POST /api/auth/change-password - Change user password (requires current password)
  - **Middleware**:
    - requireAuth - Protects all /api/* routes except /api/auth/*
    - requireRole - Checks user role for specific operations
  - **Frontend Components**:
    - AuthContext with session persistence and refresh on page load
    - Login page with username/password fields and change password form
    - Protected routes - redirects to login if not authenticated
    - Header displays logged-in user name with logout button
    - Sidebar filters menu items by role (AdminGral sees all, Administrador excludes Configuración, Usuario sees limited options)
  - **Security**:
    - All API routes protected with authentication middleware
    - Passwords hashed with bcrypt (10 salt rounds)
    - Session-based authentication with secure HTTP-only cookies
    - Unauthenticated requests return 401 Unauthorized
  - **Pending Implementation**:
    - Backend role-based data filtering (filter trabajadores/EPIs/cursos/accidentes/equipos by zona for Administrador/Usuario)
    - Frontend feature gating (disable create/edit/delete buttons based on role)

### October 15, 2025
- **Equipos - Zona Field Implementation**:
  - Added "Zona" field to equipment management
  - Zona selector positioned after "Fecha de Adquisición" in create/edit forms
  - Optional field with placeholder "Ninguna (opcional)"
  - Loads zones from zonas_trabajo catalog
  - Database: zonaId column (varchar, nullable) references zonas_trabajo.id
  - Table displays zone name in "Zona" column or "-" when unassigned
  - Enables future role-based filtering by Administrador/Usuario access level
  - End-to-end testing completed with zone selection
  - Bug fix: Removed empty string value from SelectItem (Radix UI requirement)

- **Configuración - Usuarios Management**:
  - New "Usuarios" subsection in Configuration with full user management
  - Three user access types: AdminGral, Administrador, Usuario
  - CRUD operations: Create, Read, Update, Delete users
  - Fields: nombre usuario, password (hashed with bcrypt), tipo acceso
  - **Security Implementation**:
    - Passwords hashed with bcrypt (10 salt rounds) before storage
    - Passwords never returned in API responses
    - Optional password updates (empty = no change)
    - UsuarioSinPassword type for frontend responses
  - Search/filter functionality by username and access type
  - Accordion UI pattern matching other Configuration sections
  - Database table `usuarios` with UUID primary keys
  - Full API routes with validation and security
  - Toast notifications in Spanish for all operations
  - Comprehensive end-to-end testing completed

- **Configuración - Zonas de Trabajo Catalog**:
  - New "Zonas de Trabajo" subsection in Configuration
  - Manages work zones that can be assigned to workers and equipment
  - CRUD operations: Create, Read, Update, Delete work zones
  - Search/filter functionality
  - Accordion UI pattern matching EPIS Fichas EV
  - Database table created with unique zone names
  - Full API routes and storage implementation

- **Equipos - Clickeable Document Icons in Table**:
  - Document icons (imagen, ficha, manual) in table are now clickeable
  - Click any document icon to open it directly in a new tab
  - Visual feedback: cursor changes to pointer and hover effect
  - No interference with row click for editing
  - Consistent UX with "Ver" buttons inside forms

- **Equipos - View and Download Documents**:
  - Added "Ver" (View) and "Descargar" (Download) buttons for all uploaded documents (imagen, ficha, manual)
  - Click "Ver" to open document in new browser tab
  - Click "Descargar" to download document to your device
  - Buttons appear automatically when a document is uploaded
  - **Critical Bug Fix**: Corrected object storage path saving to use UUID instead of filename
  - Documents now properly accessible without ObjectNotFoundError
  - Path format corrected from `/objects/{filename}` to `/objects/uploads/{UUID}`
  - Added hidden input field to ensure upload fields persist in form submission

- **Configuración - Collapsible EPIS Fichas EV Section**:
  - Implemented Shadcn Accordion for EPIS Fichas EV subsection
  - Section starts collapsed (minimized) by default for cleaner interface
  - Click header to expand/collapse content (search, Nuevo EPI button, table)
  - Smooth animation when expanding/collapsing
  - Title and description always visible for easy navigation

- **Equipos Table - UX Improvement**:
  - Click anywhere on equipo row to open edit dialog (no need to click pencil icon)
  - Removed pencil/edit icon from table for cleaner interface
  - Maintained trash/delete icon with proper event handling (stopPropagation)
  - Added hover-elevate effect on rows for visual feedback

- **Object Storage Upload Fix**:
  - Fixed file upload endpoint URL: changed from `/api/objects/upload-url` to `/api/objects/upload`
  - Fixed response property mapping: changed from `data.url` to `data.uploadURL`
  - File uploads now work correctly in Equipos section (imagen, ficha, manual)