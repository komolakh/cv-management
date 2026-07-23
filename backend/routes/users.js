import express from 'express'
import prisma from '../db.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

router.get('/me', async (req, res) => {
	try {
		const userId = req.userId || req.auth?.userId

		const user = await prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: {
				id: userId,
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

		return res.json({ user })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message, stack: err.stack })
	}
})

router.put('/profile/attribute', async (req, res) => {
	const { valueId, newValue, currentVersion } = req.body
	if (!valueId) return res.status(400).json({ error: 'Missing fields' })

	try {
		const model = prisma.attributeValue || prisma.profileAttributeValue
		const userId = req.userId || req.auth?.userId

		if (currentVersion === undefined) {
			const updated = await model.update({
				where: { id: valueId },
				data: { value: String(newValue || '') }
			})
			return res.json({ success: true, updated })
		}

		const parsedVersion = parseInt(currentVersion, 10)
		const { count } = await model.updateMany({
			where: { id: valueId, userId },
			data: { value: String(newValue || '') }
		})

		if (count === 0)
			return res.status(404).json({ error: 'Attribute not found.' })
		res.json({ success: true })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
})

router.get('/', requireAdmin, async (req, res) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				version: true,
				createdAt: true
			},
			orderBy: { createdAt: 'desc' }
		})
		res.json({ users })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: err.message })
	}
})

router.put('/:id/role', requireAdmin, async (req, res) => {
	const { id } = req.params
	const { newRole } = req.body
	const validRoles = ['CANDIDATE', 'RECRUITER', 'ADMINISTRATOR']
	const currentUserId = req.userId || req.auth?.userId

	if (!validRoles.includes(newRole))
		return res.status(400).json({ error: 'Invalid role.' })
	if (id === currentUserId && newRole !== 'ADMINISTRATOR')
		return res.status(400).json({ error: 'Cannot demote self.' })

	try {
		const user = await prisma.user.update({
			where: { id },
			data: { role: newRole, version: { increment: 1 } },
			select: { id: true, email: true, role: true, version: true }
		})
		res.json({ success: true, user })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: err.message })
	}
})

export default router
