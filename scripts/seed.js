import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from '@node-rs/argon2'
import { z } from 'zod'

// Initialize Prisma with logging
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
})

// Validate user schema
const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  role: z.nativeEnum(UserRole),
})

// Configuration object - frozen to prevent modifications
const CONFIG = Object.freeze({
  AUTHOR: 'Mat-png-prog',
  TIMESTAMP: '2025-04-23 14:25:24',
  SECURITY: {
    hashOptions: {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    },
    defaultPassword: 'Test@123!',
  },
  USERS: [
    {
      role: UserRole.USER,
      email: 'user@test.com',
      username: 'testuser',
    },
    {
      role: UserRole.CUSTOMER,
      email: 'customer@test.com',
      username: 'testcustomer',
    },
    {
      role: UserRole.PROCUSTOMER,
      email: 'procustomer@test.com',
      username: 'testprocustomer',
    },
    {
      role: UserRole.EDITOR,
      email: 'editor@test.com',
      username: 'testeditor',
    },
    {
      role: UserRole.ADMIN,
      email: 'admin@test.com',
      username: 'testadmin',
    },
    {
      role: UserRole.SUPERADMIN,
      email: 'superadmin@test.com',
      username: 'testsuperadmin',
    },
  ],
})

// Secure logging utility with sanitization
const log = {
  info: (message, meta = {}) => {
    const sanitizedMeta = { ...meta }
    delete sanitizedMeta.password
    delete sanitizedMeta.passwordHash
    delete sanitizedMeta.secret
    
    console.info(
      `[${new Date().toISOString()}] INFO:`,
      message,
      Object.keys(sanitizedMeta).length ? JSON.stringify(sanitizedMeta) : ''
    )
  },
  error: (message, error) => {
    console.error(
      `[${new Date().toISOString()}] ERROR:`,
      message,
      error instanceof Error ? error.message : ''
    )
  },
  warn: (message, meta = {}) => {
    console.warn(
      `[${new Date().toISOString()}] WARN:`,
      message,
      Object.keys(meta).length ? JSON.stringify(meta) : ''
    )
  },
}

// Prisma event logging setup
prisma.$on('query', (e) => {
  log.info('Query', { query: e.query, duration: e.duration })
})

prisma.$on('error', (e) => {
  log.error('Database error', e)
})

prisma.$on('warn', (e) => {
  log.warn('Database warning', e)
})

async function seedDatabase() {
  const startTime = performance.now()
  log.info('Starting database seed', {
    timestamp: CONFIG.TIMESTAMP,
    author: CONFIG.AUTHOR,
    environment: process.env.NODE_ENV,
  })

  try {
    // Validate all users before processing
    CONFIG.USERS.forEach((user) => {
      try {
        userSchema.parse(user)
      } catch (e) {
        if (e instanceof z.ZodError) {
          log.error(`Invalid user data for ${user.email}`, e)
          throw e
        }
      }
    })

    // Generate password hash once for all users
    const passwordHash = await hash(
      CONFIG.SECURITY.defaultPassword,
      CONFIG.SECURITY.hashOptions
    )

    let successCount = 0
    let failureCount = 0

    // Process users
    for (const userData of CONFIG.USERS) {
      try {
        const user = await prisma.user.upsert({
          where: { email: userData.email },
          update: {}, // No updates if exists
          create: {
            email: userData.email,
            username: userData.username,
            passwordHash,
            firstName: 'Test',
            lastName: userData.role.toLowerCase(),
            displayName: `Test ${userData.role.toLowerCase()}`,
            streetAddress: '123 Test Street',
            suburb: 'Test Suburb',
            townCity: 'Test City',
            postcode: '12345',
            country: 'Test Country',
            agreeTerms: true,
            role: userData.role,
          },
        })

        successCount++
        log.info(`Processed user: ${userData.role}`, {
          email: user.email,
          role: user.role,
          id: user.id,
        })
      } catch (error) {
        failureCount++
        log.error(`Failed to process user: ${userData.email}`, error)
      }
    }

    const endTime = performance.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    log.info('Seed completed', {
      duration: `${duration}s`,
      successful: successCount,
      failed: failureCount,
      total: CONFIG.USERS.length,
    })
  } catch (error) {
    log.error('Fatal error during seed process', error)
    throw error
  } finally {
    await prisma.$disconnect()
    log.info('Database connection closed')
  }
}

// Enhanced error handling
process.on('unhandledRejection', (error) => {
  log.error('Unhandled rejection', error)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  log.error('Uncaught exception', error)
  process.exit(1)
})

// Execute seed with error handling
seedDatabase()
  .catch((error) => {
    log.error('Seed failed', error)
    process.exit(1)
  })