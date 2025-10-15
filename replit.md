# Occupational Safety Management System

## Overview

This Occupational Safety Management System is a full-stack web application designed to help organizations manage worker information, safety equipment (EPIs), training courses, and workplace accidents. Its purpose is to provide a comprehensive solution for tracking employee safety compliance, equipment distribution, training records, and incident reporting, thereby enhancing workplace safety and regulatory adherence. The system focuses on robust data management, a professional user interface, and efficient workflows for safety officers and administrators.

## User Preferences

Preferred communication style: Simple, everyday language (Spanish).

## Recent Changes

### October 15, 2025 (Latest)
- **New Section: Equipos (Equipment Management)**:
  - Created new "Equipos" section in sidebar under Gestión
  - Complete equipment and machinery management system
  - Features:
    - CRUD operations for equipment
    - File uploads for: Equipment image, Evaluation sheet (Ficha evaluación), Manual
    - Multi-select EPIs obligatorios from EPIS Fichas EV catalog
    - Search/filter by brand (marca) or model (modelo)
    - Visual indicators for uploaded documents
  - Database: 
    - New table `equipos` with UUID primary key
    - New table `equipos_epis_obligatorios` for many-to-many relationship with EPIS Fichas EV
  - API: Complete REST endpoints at `/api/equipos` and `/api/equipos/:id/epis-obligatorios`
  - File Storage: Integration with Replit Object Storage for documents and images
  - UI: Full-featured page with create/edit dialogs, file upload integration, and multi-select checkboxes
  - Technical fixes:
    - Corrected form validation schema to use `z.array(z.string()).optional()` for episObligatorios
    - Added useEffect to synchronize existing EPIs into edit form, preventing data loss during edits
    - End-to-end testing confirms EPIs are preserved when editing without modifying selections

- **New Configuration Section - EPIS Fichas EV**:
  - Created new "Configuración" section accessible from sidebar (Sistema > Configuración)
  - Implemented "EPIS Fichas EV" catalog subsection for managing EPI names
  - This is a separate catalog from EPIs delivery tracking system
  - Features:
    - Create, read, update, delete EPI names
    - Search/filter functionality
    - Alphabetically sorted list
    - Unique constraint on EPI names
    - Full CRUD operations with validation
  - Database: New table `epis_fichas_ev` with UUID primary key
  - API: Complete REST endpoints at `/api/epis-fichas-ev`
  - UI: Clean interface with forms, table, and search

- **Worker Detail Dialog Enhancement**:
  - Added "Accidentes Laborales" section to worker detail view
  - Shows table with accident information: Fecha, Tipo, Gravedad, Descripción
  - Accidents sorted by date (most recent first)
  - Color-coded severity badges: GRAVE (red), MODERADO (blue), LEVE (gray)
  - Type badges: "Accidente en servicio" or "Enfermedad profesional"
  - Empty state message when worker has no accidents

- **Dashboard Statistics Updated**:
  - Changed static mock data to real-time database queries
  - Total Trabajadores: Shows actual count from database
  - EPIs Entregados: Shows total registered EPIs
  - Cursos Realizados: Shows total registered courses
  - Accidentes: Shows total registered accidents
  - Updated descriptions to "Total registrados" for accuracy

- **UI Terminology Updates**:
  - Changed "Nº Correlativo" to "Código EPI" throughout the interface
  - Updated EPIs table header
  - Updated document dialog title to show "Código EPI: [number]"

### October 15, 2025
- **EPI Documentation System - Digitized Storage with Replit App Storage**:
  - **Object Storage Integration**:
    - Integrated Replit App Storage ($0.03/GB/month) for cloud-based document storage
    - Created `server/objectStorage.ts` for Google Cloud Storage integration via Replit sidecar
    - Created `server/objectAcl.ts` for public document access control
    - Documents stored in `.private/epi-docs/` directory within bucket
  - **Database Schema Updates**:
    - Added `numeroCorrelativo` field to `epis` table (unique, format: EPI[YEAR]_[###])
    - Created `epiDocumentos` table to track uploaded documents with metadata
    - Automatic correlative number generation for new EPIs (starts at 001 per year)
  - **Backend Routes**:
    - `POST /api/upload-url` - Generates signed upload URLs for Uppy file uploader
    - `POST /api/epi-documentos` - Creates document records after upload
    - `GET /api/epi-documentos/:epiId` - Retrieves documents for specific EPI
    - `GET /api/epi-documentos/download/:id` - Generates signed download URLs
    - `DELETE /api/epi-documentos/:id` - Removes documents from storage and database
  - **Frontend Components**:
    - Created `ObjectUploader` component using Uppy Dashboard for file uploads
    - Created `EpiDocumentosDialog` for document management UI
    - Added "Ver Documentos" button in EPIs table for each delivery record
    - Document list with download and delete functionality
  - **Cost & Performance**:
    - Estimated <$0.03/month for typical use (500 workers, minimal document storage)
    - Public access URLs for easy document sharing without authentication barriers
    - Cloud-based storage replaces local filesystem requirement (C:\PREVENCION\EPIS\)

### October 13, 2025
- **Accidentes Laborales Section Enhancement**: Complete redesign of the workplace accidents management system
  - **Schema Updates**:
    - Added `centroTrabajo` (work center) field to track where accident occurred
    - Added `tipoAccidente` enum field with two types:
      - "ACCIDENTE_SERVICIO" (Accident in act of service)
      - "ENFERMEDAD_PROFESIONAL" (Professional illness)
    - Added `lugarAccidente` (accident location) field for specific location details
    - Added `horaAccidente` (accident time) field to record exact time
    - Added `trabajadorParteId` (optional FK) to track who files the accident report
  - **Form Enhancements**:
    - Changed from fixed trabajadorId prop to dynamic worker selector dropdown
    - Added automatic category display (readonly) based on selected worker
    - Added all new required fields with proper validation
    - Added filtered selector for "Persona que hace el parte" (only Encargado or Enc. gral. o.p.)
    - Comprehensive Zod validation for all fields
  - **Page Improvements**:
    - Replaced mock data with real API integration
    - Added search filter by worker name with real-time filtering
    - Added "Nuevo Accidente" button with dialog-based form
    - Updated table to display new columns: Type, Time, Location
    - Automatic sorting by date (most recent first)
    - Proper mutation handling with cache invalidation
  - **Database Migration**:
    - Successfully executed `npm run db:push` to add new columns
    - All data persisted correctly in PostgreSQL
  - **Edit and Delete Functionality**:
    - Added three-dot menu (MoreVertical icon) in each table row
    - Edit option opens pre-filled form dialog with all existing data
    - Delete option shows confirmation dialog before removal
    - Both operations properly invalidate React Query cache
    - Mutations handle success/error states with toast notifications
  - **Testing & Verification**:
    - End-to-end tests pass successfully
    - Accident creation works correctly with all new fields
    - Edit functionality tested and working (updates data correctly)
    - Delete functionality tested and working (removes records with confirmation)
    - Search and filtering functionality verified
    - All CRUD operations tested and working

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