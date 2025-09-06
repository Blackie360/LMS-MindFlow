# MindFlow LMS

A modern, AI-powered Learning Management System built with Next.js, Prisma, and shadcn/ui.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp env.example .env.local

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

## 🚀 Deployment

For production deployment, see our comprehensive [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

**Key Points:**
- All URLs are configurable via environment variables
- No hardcoded localhost references in production code
- Easy deployment to any platform (Vercel, Railway, DigitalOcean, etc.)

## 📚 Documentation

All documentation is organized in the **[`/docs`](./docs/)** folder:

- **Setup Guide**: [docs/SETUP_CHECKLIST.md](./docs/SETUP_CHECKLIST.md)
- **Authentication**: [docs/AUTH_README.md](./docs/AUTH_README.md)
- **Organization Setup**: [docs/ORGANIZATION_SETUP_GUIDE.md](./docs/ORGANIZATION_SETUP_GUIDE.md)
- **Role-Based Routing**: [docs/ROLE_BASED_ROUTING_GUIDE.md](./docs/ROLE_BASED_ROUTING_GUIDE.md)
- **Dashboard System**: [docs/ROLE_BASED_DASHBOARDS.md](./docs/ROLE_BASED_DASHBOARDS.md)
- **Testing Guide**: [docs/ROLE_ROUTING_TESTING_GUIDE.md](./docs/ROLE_ROUTING_TESTING_GUIDE.md)
- **Complete Documentation**: [docs/README.md](./docs/README.md)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Prisma, PostgreSQL
- **Authentication**: Custom auth system
- **Deployment**: Vercel-ready

## 🎯 Key Features

### Role-Based Dashboard System
- **Automatic Role Detection**: Users are automatically routed to appropriate dashboards based on their roles
- **Multi-Role Support**: Super Admin, Instructor, and Student dashboards
- **Organization-Based Roles**: Role hierarchy with organization creators as super admins
- **Seamless Navigation**: Intelligent routing that ensures users see relevant features

### User Roles
- **Super User**: Organization creators with full system access
- **Instructor**: Teaching staff with course management capabilities
- **Student**: Learners with access to enrolled courses and progress tracking

## 📖 Learn More

Visit the [docs folder](./docs/) for comprehensive guides and tutorials.


