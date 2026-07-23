import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import pg from 'pg'
import { PrismaClient } from './generated/client/index.js'

let instance = null
let initError = null

try {
	let connectionString = process.env.DATABASE_URL
	if (!connectionString) {
		throw new Error('No DATABASE_URL')
	}

	connectionString = connectionString.replace(/['"]/g, '')

	const pool = new pg.Pool({
		connectionString,
		max: 10,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 5000
	})

	const adapter = new PrismaPg(pool)

	instance = new PrismaClient({ adapter })
} catch (error) {
	initError = error
}

const prisma = new Proxy(
	{},
	{
		get(target, modelName) {
			if (instance && !initError && instance[modelName]) {
				return instance[modelName]
			}
			return new Proxy(
				{},
				{
					get(subTarget, methodName) {
						return async () => {
							throw new Error(
								`[prisma.${modelName}.${methodName}]: ${initError?.message}`
							)
						}
					}
				}
			)
		}
	}
)

export default prisma
export { prisma }
