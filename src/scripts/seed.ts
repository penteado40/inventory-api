import 'dotenv/config'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME

if (!email || !password || !name) {
  console.error('Missing required env vars: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME')
  process.exit(1)
}

const existing = await prisma.user.findFirst({ where: { role: 'admin' } })

if (existing) {
  console.log('Admin already exists')
  await prisma.$disconnect()
  process.exit(0)
}

const hashed = await bcrypt.hash(password, 10)

const admin = await prisma.user.create({
  data: { name, email, password: hashed, role: 'admin', storeId: null },
})

console.log(`Admin user created: ${admin.email}`)
await prisma.$disconnect()
