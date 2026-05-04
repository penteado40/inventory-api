import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

const url = process.env.DATABASE_URL ?? ''

export default defineConfig({
  datasource: { url },
  migrate: {
    async adapter() {
      return new PrismaPg({ connectionString: url })
    },
  },
})
