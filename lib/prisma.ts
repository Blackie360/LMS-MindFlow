import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.warn(`⚠️ Missing environment variables: ${missingEnvVars.join(', ')}`)
  console.warn('Build will continue but database operations may fail')
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 'postgresql://placeholder',
    },
  },
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Handle connection errors gracefully
prisma.$connect()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Prisma Client connected successfully')
    }
  })
  .catch((error) => {
    console.error('❌ Prisma Client connection failed:', error)
    // Don't throw during build time
    if (process.env.NODE_ENV === 'production') {
      console.warn('Prisma connection failed, continuing with build...')
    }
  })
