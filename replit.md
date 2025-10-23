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

## Recent Changes

### October 23, 2025

#### EPIs Module - Usuario Role UI Customization
- **Modified EPI Detail Dialog for Usuario Role**:
  - Hidden "Generar Documento de Entrega" button for Usuario users
  - Added digital signature display in detail dialog when signature exists
  - Shows "Este EPI aún no ha sido firmado" message when no signature is present
  - Administrador and AdminGral roles continue to see the document generation button

- **EPI List Table Customization for Usuario Role**:
  - Hidden "Código EPI" column for Usuario users to simplify their view
  - Column remains visible for Administrador and AdminGral roles

- **Implementation Details**:
  - Updated `epi-detail-dialog.tsx` to conditionally render based on user role
  - Modified `epis.tsx` to pass `firmaUrl` to detail dialog and hide column based on role
  - Maintains full backward compatibility for other roles

#### EPIs Module - Administrador Print Enhancement and Signature Integration
- **Auto-Print for Administrador Role**:
  - When Administrador clicks "Generar Documento de Entrega", print dialog opens automatically
  - AdminGral users retain preview-before-print workflow
  - Implemented with 100ms delay to ensure DOM is ready

- **Digital Signature in Delivery Document**:
  - EPI delivery documents now display digital signature below "Firmado: {trabajadorNombre}"
  - Signature image appears when worker has signed the EPI
  - Falls back to traditional signature line when no digital signature exists
  - Print-optimized sizing: h-20 on screen, h-16 for print

- **Print Layout Optimization**:
  - Fixed excessive top margin in printed documents
  - Content now starts near the top of the page instead of middle
  - Adjusted print spacing: reduced title margin (my-16 → my-4), logo margin (mb-6 → mb-3), and separator height (h-10 → h-3)
  - Document remains readable and fits comfortably on A4 page

- **Implementation Details**:
  - Enhanced `epi-detail-dialog.tsx` with role-based auto-print trigger
  - Updated `epi-delivery-document.tsx` to accept and display `firmaUrl` prop
  - Optimized print-specific CSS classes for better page positioning
  - Conditional rendering maintains document layout with or without signature

#### Dashboard - Unsigned EPIs Alert
- **Attention Message for Pending Signatures**:
  - Dashboard displays an alert when there are EPIs without digital signatures
  - Shows the exact count of unsigned EPIs with proper Spanish singular/plural grammar
  - Alert appears between statistics cards and worker search section
  - Only visible when there is at least one unsigned EPI
  - Uses AlertCircle icon for visual attention

- **Implementation Details**:
  - Added shadcn Alert component to dashboard
  - Calculates unsigned EPIs by filtering where `firmaUrl` is null, undefined, or empty string
  - Conditional rendering: `{episSinFirma > 0 && <Alert>...}</Alert>`
  - Proper text formatting: "Hay **X** documento(s) de entrega de EPIs pendientes de firma digital"
  - Includes `data-testid="alert-epis-sin-firma"` for testing