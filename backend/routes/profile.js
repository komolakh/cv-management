import { Router } from 'express'
import prisma from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
	try {
		const user = await prisma.user.upsert({
			where: { id: req.userId },
			update: {},
			create: {
				id: req.userId,
				email: '',
				role: 'CANDIDATE'
			}
		})

		const [userAttributes, projects, cvs] = await Promise.all([
			prisma.profileAttributeValue.findMany({
				where: { userId: req.userId },
				include: {
					attributeLibrary: true
				}
			}),
			prisma.project.findMany({
				where: { userId: req.userId },
				orderBy: { startDate: 'desc' }
			}),
			prisma.cV.findMany({
				where: { userId: req.userId },
				include: {
					position: true
				}
			})
		])

		return res.json({ user, projects, userAttributes, cvs })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

router.put('/autosave', async (req, res) => {
	try {
		const { me = {}, attributes = {}, version } = req.body

		const user = await prisma.user.findUnique({ where: { id: req.userId } })
		if (!user) return res.status(404).json({ error: 'Not authorized' })

		if (version !== undefined && user.version !== version) {
			return res.status(409).json({ error: 'Version conflict' })
		}

		const nextVersion = user.version + 1

		await prisma.user.update({
			where: { id: req.userId },
			data: {
				firstName: me.firstName !== undefined ? me.firstName : user.firstName,
				lastName: me.lastName !== undefined ? me.lastName : user.lastName,
				location: me.location !== undefined ? me.location : user.location,
				photoUrl: me.photoUrl !== undefined ? me.photoUrl : user.photoUrl,
				version: nextVersion
			}
		})

		const updatePromises = Object.entries(attributes).map(([attrValId, val]) =>
			prisma.profileAttributeValue.updateMany({
				where: { id: attrValId, userId: req.userId },
				data: { value: String(val) }
			})
		)
		await Promise.all(updatePromises)

		return res.json({
			message: 'Saved',
			newVersion: nextVersion
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

router.post('/attributes', async (req, res) => {
	try {
		const { attributeId, value = '' } = req.body
		if (!attributeId)
			return res.status(400).json({ error: 'attributeId required' })

		const attr = await prisma.profileAttributeValue.create({
			data: {
				userId: req.userId,
				attributeId,
				value: String(value)
			},
			include: {
				attributeLibrary: true
			}
		})

		return res.status(201).json(attr)
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

router.put('/attributes/:id', async (req, res) => {
	try {
		const { id } = req.params
		const { value = '' } = req.body

		const existing = await prisma.profileAttributeValue.findFirst({
			where: {
				userId: req.userId,
				OR: [{ id }, { attributeId: id }]
			}
		})

		let updated
		if (existing) {
			updated = await prisma.profileAttributeValue.update({
				where: { id: existing.id },
				data: { value: String(value) },
				include: {
					attributeLibrary: true
				}
			})
		} else {
			updated = await prisma.profileAttributeValue.create({
				data: {
					userId: req.userId,
					attributeId: id,
					value: String(value)
				},
				include: {
					attributeLibrary: true
				}
			})
		}

		return res.json(updated)
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

router.delete('/attributes/:id', async (req, res) => {
	try {
		await prisma.profileAttributeValue.deleteMany({
			where: {
				userId: req.userId,
				OR: [{ id: req.params.id }, { attributeId: req.params.id }]
			}
		})
		return res.json({ success: true })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

router.post('/projects', async (req, res) => {
	try {
		const { name, startDate, endDate, description = '', tags = [] } = req.body

		if (!name?.trim())
			return res.status(400).json({ error: 'Project name required' })

		const project = await prisma.project.create({
			data: {
				userId: req.userId,
				name: name.trim(),
				startDate: new Date(startDate || Date.now()),
				endDate: endDate ? new Date(endDate) : null,
				description,
				tags: Array.isArray(tags) ? tags : []
			}
		})

		return res.status(201).json(project)
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

router.delete('/projects/:id', async (req, res) => {
	try {
		await prisma.project.deleteMany({
			where: { id: req.params.id, userId: req.userId }
		})
		return res.json({ success: true })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

export default router
