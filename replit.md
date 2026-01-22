# Trims Inventory Management System

## Overview

A mission-critical Trims Inventory Management website designed for industrial/warehouse environments. The system provides fast, error-free inventory tracking with material entry, issue tracking, search functionality, and real-time dashboard analytics. Built with an emergency-ready, high-contrast industrial UI optimized for speed and clarity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom industrial dark theme (sharp corners, high contrast, yellow/cyan accents)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for smooth transitions
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts`
- **Build System**: Vite for frontend, esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines materials, logs, users, and sessions tables
- **Migrations**: Drizzle Kit with `db:push` command

### Authentication
- **Provider**: Replit Auth (OpenID Connect)
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **User Management**: Automatic user upsert on authentication

### Key Data Models
- **Materials**: Tracks inventory items with code, quantity, rack/bin location
- **Logs**: Audit trail for entry/issue actions with timestamps
- **Users/Sessions**: Authentication state management

### API Structure
Routes are defined in `shared/routes.ts` with Zod schemas for input validation:
- `GET/POST /api/materials` - List and manage materials
- `POST /api/actions/entry` - Add inventory (increases quantity)
- `POST /api/actions/issue` - Remove inventory (decreases quantity)
- `GET /api/logs` - Activity logs
- `GET /api/stats` - Dashboard statistics

## External Dependencies

### Database
- PostgreSQL (required, connection via `DATABASE_URL` environment variable)

### Authentication Services
- Replit Auth OIDC provider (`ISSUER_URL` defaults to https://replit.com/oidc)
- Requires `SESSION_SECRET` and `REPL_ID` environment variables

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `express` / `express-session` - HTTP server and session management
- `passport` - Authentication middleware
- `xlsx` - Excel export functionality for inventory reports
- `recharts` - Dashboard charts and visualization
- `date-fns` - Date formatting utilities