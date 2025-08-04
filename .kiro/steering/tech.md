# Technology Stack

## Framework & Runtime
- **Next.js 14.2.16** - React framework with App Router
- **React 18** - UI library with TypeScript support
- **Node.js** - Runtime environment
- **Package manager** - PNPM

## Database & ORM
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM and schema management
- **Supabase** - Database hosting and additional services

## Authentication
- **Better Auth 1.3.4** - Modern authentication library
- **bcryptjs** - Password hashing

## UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library
- **shadcn/ui** - Pre-built component system
- **CSS Variables** - Theme system with dark mode support

## Development Tools
- **TypeScript 5** - Type safety
- **ESLint** - Code linting (build errors ignored)
- **PostCSS** - CSS processing

## Common Commands

### Development
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Database
```bash
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema changes
npx prisma studio      # Open Prisma Studio
npx prisma db seed     # Run seed script
```

## Configuration Notes
- **Path aliases**: `@/*` maps to project root
- **Build configuration**: ESLint and TypeScript errors ignored during builds
- **Images**: Unoptimized for deployment flexibility
- **Fonts**: Inter (primary) and Poppins (headings) from Google Fonts