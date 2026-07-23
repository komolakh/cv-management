import express from 'express'
import prisma from '../db.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

router.post('/sync', async (req, res) => {
	try {
		const { firstName, lastName, emailAddresses } = req.body
		const user = await prisma.user.upsert({
			where: { id: req.userId },
			update: { firstName: firstName || 'New', lastName: lastName || 'User' },
			create: {
				id: req.userId,
				email:
					emailAddresses?.[0]?.emailAddress ||
					emailAddresses?.[0]?.email ||
					'no-email@test.com',
				firstName: firstName || 'New',
				lastName: lastName || 'User',
				role: 'CANDIDATE',
				version: 1
			}
		})
		return res.json({ success: true, user })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

router.get('/me', async (req, res) => {
	try {
		let user = await prisma.user.findUnique({
			where: { id: req.userId },
			include: {
				profileAttributeValues: {
					include: {
						attributeLibrary: true
					}
				}
			}
		})

		if (!user) {
			user = await prisma.user.create({
				data: {
					id: req.userId,
					email: 'sync-pending@test.com',
					firstName: 'New',
					lastName: 'User',
					role: 'CANDIDATE',
					version: 1
				},
				include: {
					profileAttributeValues: {
						include: {
							attributeLibrary: true
						}
					}
				}
			})
		}

		return res.json(user)
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

router.get('/users', requireAdmin, async (req, res) => {
	try {
		const users = await prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				version: true,
				createdAt: true,
				updatedAt: true
			}
		})
		return res.json(users)
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

router.patch('/users/:id/role', requireAdmin, async (req, res) => {
	const { role, version } = req.body
	const VALID_ROLES = ['CANDIDATE', 'RECRUITER', 'ADMINISTRATOR']

	if (!VALID_ROLES.includes(role)) {
		return res
			.status(400)
			.json({ error: `Invalid role. Allowed: ${VALID_ROLES.join(', ')}` })
	}

	try {
		const existingUser = await prisma.user.findUnique({
			where: { id: req.params.id }
		})
		if (!existingUser) return res.status(404).json({ error: 'User not found' })

		if (version !== undefined && existingUser.version !== version) {
			return res.status(409).json({
				error: 'Version conflict: Data modified by another request.'
			})
		}

		const updatedUser = await prisma.user.update({
			where: { id: req.params.id },
			data: { role, version: { increment: 1 } }
		})

		return res.json({
			success: true,
			user: {
				id: updatedUser.id,
				email: updatedUser.email,
				role: updatedUser.role,
				version: updatedUser.version
			}
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

export default router
