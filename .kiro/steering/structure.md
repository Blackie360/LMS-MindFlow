# Project Structure

## Root Directory Organization

### Core Application
- **`app/`** - Next.js App Router pages and layouts
  - **`(dashboard)/`** - Route groups for dashboard layouts
  - **`api/`** - API route handlers
  - **`auth/`** - Authentication pages
  - **`courses/`** - Course-related pages
  - **`dashboard/`** - Main dashboard pages
  - **`globals.css`** - Global styles and CSS variables
  - **`layout.tsx`** - Root layout with providers
  - **`page.tsx`** - Landing page

### Components
- **`components/`** - Reusable React components organized by feature
  - **`admin/`** - Admin-specific components
  - **`auth/`** - Authentication components
  - **`courses/`** - Course management components
  - **`dashboard/`** - Dashboard components
  - **`landing/`** - Landing page components
  - **`layout/`** - Layout components (navigation, sidebars)
  - **`ui/`** - shadcn/ui base components
  - **`theme-provider.tsx`** - Theme context provider

### Business Logic
- **`lib/`** - Shared utilities and business logic
  - **`auth*.ts`** - Authentication utilities (client, server, session)
  - **`constants.ts`** - Application constants and configuration
  - **`db.ts`** - Database connection utilities
  - **`prisma.ts`** - Prisma client configuration
  - **`utils.ts`** - General utility functions
  - **`*-validation.ts`** - Input validation schemas

### Data Layer
- **`prisma/`** - Database schema and migrations
  - **`schema.prisma`** - Database schema definition
  - **`seed.ts`** - Database seeding script

### Supporting Directories
- **`hooks/`** - Custom React hooks
- **`types/`** - TypeScript type definitions
- **`public/`** - Static assets (images, icons)
- **`scripts/`** - Database scripts and utilities

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `HeroSection.tsx`)
- **Pages**: kebab-case (e.g., `my-courses`)
- **Utilities**: kebab-case (e.g., `auth-client.ts`)
- **Types**: kebab-case (e.g., `dashboard.ts`)

### Components
- Use descriptive, feature-based names
- Group related components in feature folders
- Export components as named exports when possible

## Architecture Patterns

### Route Organization
- Use Next.js App Router with route groups `(dashboard)`
- Separate public routes (landing) from protected routes (dashboard)
- Role-based routing with middleware protection

### Component Structure
- Feature-based component organization
- Shared UI components in `components/ui/`
- Business logic separated into `lib/` utilities

### Authentication Flow
- Centralized auth utilities in `lib/auth*.ts`
- Role-based access control with middleware
- Session management with Better Auth

### Database Access
- Prisma ORM for type-safe database operations
- Centralized database utilities in `lib/`
- Seed scripts for development data