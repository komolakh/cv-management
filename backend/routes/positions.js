import express from 'express'
import crypto from 'node:crypto'
import prisma from '../db.js'
import { requireAuth, requireRecruiterOrAdmin } from '../middleware/auth.js'

const router = express.Router()

const formatPos = p =>
	p
		? {
				...p,
				templateAttributes: p.positionTemplateAttributes || []
		  }
		: null

router.get('/public-stats', async (_, res) => {
	try {
		const last24h = new Date(Date.now() - 86400000)
		const [
			totalPositions,
			totalCandidates,
			totalRecruiters,
			totalSubmittedCvs,
			newCvsLast24h
		] = await prisma.$transaction([
			prisma.position.count(),
			prisma.user.count({ where: { role: 'CANDIDATE' } }),
			prisma.user.count({ where: { role: 'RECRUITER' } }),
			prisma.cV.count(),
			prisma.cV.count({ where: { createdAt: { gte: last24h } } })
		])
		res.json({
			totalPositions,
			totalCandidates,
			totalRecruiters,
			totalSubmittedCvs,
			newCvsLast24h
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
})

router.get('/tags', async (_, res) => {
	try {
		const positions = await prisma.position.findMany({
			select: { projectTags: true }
		})
		const counts = {}
		positions.forEach(p =>
			p.projectTags?.forEach(
				t => t && (counts[t.trim()] = (counts[t.trim()] || 0) + 1)
			)
		)
		res.json(
			Object.entries(counts).map(([name, count]) => ({
				name,
				count,
				weight: count
			}))
		)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
})

router.get('/popular', async (_, res) => {
	try {
		const popular = await prisma.position.findMany({
			take: 5,
			select: {
				id: true,
				title: true,
				_count: { select: { cvs: true, CVs: true } }
			},
			orderBy: {
				cvs: { _count: 'desc' }
			}
		})
		res.json(
			popular.map(p => ({
				id: p.id,
				title: p.title,
				submittedCvsCount: p._count.cvs || p._count.CVs || 0
			}))
		)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
})

router.get('/', async (req, res) => {
	try {
		const { search } = req.query

		const positions = await prisma.position.findMany({
			where: search
				? { title: { contains: String(search).trim(), mode: 'insensitive' } }
				: {},
			include: {
				positionTemplateAttributes: {
					include: { attributeLibrary: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		})
		res.json(positions.map(formatPos))
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
})

router.get('/:id', async (req, res) => {
	try {
		const position = await prisma.position.findUnique({
			where: { id: req.params.id },
			include: {
				positionTemplateAttributes: {
					include: { attributeLibrary: true }
				}
			}
		})
		if (!position) return res.status(404).json({ error: 'Not found' })
		res.json(formatPos(position))
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
})

router.post('/', requireAuth, requireRecruiterOrAdmin, async (req, res) => {
	try {
		const {
			title,
			shortDescription,
			description,
			accessRules,
			projectTags,
			attributeIds
		} = req.body
		if (!title?.trim()) return res.status(400).json({ error: 'Title required' })

		const position = await prisma.position.create({
			data: {
				id: crypto.randomUUID(),
				title: title.trim(),
				description: description || shortDescription || title.trim(),
				accessRules: accessRules || { isPublic: true },
				projectTags: Array.isArray(projectTags) ? projectTags : [],
				positionTemplateAttributes: {
					create: (attributeIds || []).map(attributeId => ({ attributeId }))
				}
			},
			include: {
				positionTemplateAttributes: {
					include: { attributeLibrary: true }
				}
			}
		})
		res.status(201).json(formatPos(position))
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
})

router.post(
	'/:id/duplicate',
	requireAuth,
	requireRecruiterOrAdmin,
	async (req, res) => {
		try {
			const src = await prisma.position.findUnique({
				where: { id: req.params.id },
				include: {
					positionTemplateAttributes: true
				}
			})
			if (!src) return res.status(404).json({ error: 'Not found' })

			const attributesList = src.positionTemplateAttributes || []

			const duplicated = await prisma.position.create({
				data: {
					id: crypto.randomUUID(),
					title: `${src.title} (copy)`,
					description: src.description,
					accessRules: src.accessRules || { isPublic: true },
					projectTags: src.projectTags || [],
					positionTemplateAttributes: {
						create: attributesList.map(a => ({
							attributeId: a.attributeId
						}))
					}
				},
				include: {
					positionTemplateAttributes: {
						include: { attributeLibrary: true }
					}
				}
			})
			res.status(201).json(formatPos(duplicated))
		} catch (err) {
			console.error(err)
			res.status(500).json({ error: err.message })
		}
	}
)

router.delete(
	'/:id',
	requireAuth,
	requireRecruiterOrAdmin,
	async (req, res) => {
		try {
			const { id } = req.params
			await prisma.$transaction([
				prisma.positionTemplateAttributes.deleteMany({
					where: { positionId: id }
				}),
				prisma.position.delete({ where: { id } })
			])
			res.json({ success: true })
		} catch (err) {
			console.error(err)
			res.status(500).json({ error: err.message })
		}
	}
)

export default router
