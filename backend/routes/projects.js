import { Router } from 'express'
import prisma from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
	try {
		const clerkUserId = req.userId

		const projects = await prisma.project.findMany({
			where: { userId: clerkUserId },
			orderBy: { id: 'desc' }
		})

		return res.json(projects)
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

router.post('/', async (req, res) => {
	try {
		const clerkUserId = req.userId
		const { title, name, description, startDate, endDate, tags, version } =
			req.body

		const projectTitle = (name || title || '').trim()

		if (!projectTitle) {
			return res.status(400).json({ error: 'Fill name' })
		}

		const user = await prisma.user.findUnique({
			where: { id: clerkUserId }
		})

		if (!user) {
			return res.status(404).json({ error: 'No user found' })
		}

		if (version !== undefined && user.version !== version) {
			return res.status(409).json({ error: 'Version conflict' })
		}

		const nextVersion = (user.version || 1) + 1

		const [newProject, updatedUser] = await prisma.$transaction([
			prisma.project.create({
				data: {
					userId: clerkUserId,
					name: projectTitle,
					description: description || '',
					startDate: startDate ? new Date(startDate) : null,
					endDate: endDate ? new Date(endDate) : null,
					tags: Array.isArray(tags) ? tags : []
				}
			}),
			prisma.user.update({
				where: { id: clerkUserId },
				data: { version: nextVersion }
			})
		])

		return res.status(201).json({
			project: newProject,
			newVersion: updatedUser.version
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

router.put('/:id', async (req, res) => {
	try {
		const clerkUserId = req.userId
		const { id: projectId } = req.params

		if (!clerkUserId) {
			return res.status(401).json({ error: 'Не авторизован' })
		}

		const { title, name, description, startDate, endDate, tags, version } =
			req.body
		const projectTitle = (name || title || '').trim()

		if (!projectTitle) {
			return res.status(400).json({ error: 'Fill name' })
		}

		const user = await prisma.user.findUnique({
			where: { id: clerkUserId }
		})

		if (!user) {
			return res.status(404).json({ error: 'No user' })
		}

		if (version !== undefined && user.version !== version) {
			return res.status(409).json({ error: 'Version conflict' })
		}

		const existingProject = await prisma.project.findUnique({
			where: { id: projectId }
		})

		if (!existingProject || existingProject.userId !== clerkUserId) {
			return res.status(404).json({ error: 'No project found' })
		}

		const nextVersion = (user.version || 1) + 1

		const [updatedProject, updatedUser] = await prisma.$transaction([
			prisma.project.update({
				where: { id: projectId },
				data: {
					name: projectTitle,
					description:
						description !== undefined
							? description
							: existingProject.description,
					startDate: startDate
						? new Date(startDate)
						: existingProject.startDate,
					endDate: endDate ? new Date(endDate) : existingProject.endDate,
					tags: Array.isArray(tags) ? tags : existingProject.tags
				}
			}),
			prisma.user.update({
				where: { id: clerkUserId },
				data: { version: nextVersion }
			})
		])

		return res.json({
			project: updatedProject,
			newVersion: updatedUser.version
		})
	} catch (err) {
		console.error(err)
		return res
			.status(500)
			.json({ error: 'Внутренняя ошибка сервера: ' + err.message })
	}
})

router.delete('/:id', async (req, res) => {
	try {
		const clerkUserId = req.userId
		const { id: projectId } = req.params
		const rawVersion =
			req.query.version !== undefined ? req.query.version : req.body?.version
		const version =
			rawVersion !== undefined ? parseInt(rawVersion, 10) : undefined

		const user = await prisma.user.findUnique({
			where: { id: clerkUserId }
		})

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		if (version !== undefined && !isNaN(version) && user.version !== version) {
			return res.status(409).json({ error: 'Version conflict' })
		}

		const project = await prisma.project.findUnique({
			where: { id: projectId }
		})

		if (!project || project.userId !== clerkUserId) {
			return res.status(404).json({ error: 'Project not found' })
		}

		const nextVersion = (user.version || 1) + 1

		const [, updatedUser] = await prisma.$transaction([
			prisma.project.delete({
				where: { id: projectId }
			}),
			prisma.user.update({
				where: { id: clerkUserId },
				data: { version: nextVersion }
			})
		])

		return res.json({
			newVersion: updatedUser.version
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ error: err.message })
	}
})

export default router
