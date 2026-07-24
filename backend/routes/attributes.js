import express from 'express'
import prisma from '../db.js'
import { requireAuth, requireRecruiterOrAdmin } from '../middleware/auth.js'

const router = express.Router()

const TYPE_MAP = {
	STRING: 'STRING',
	TEXT: 'TEXT',
	IMAGE: 'IMAGE',
	NUMERIC: 'NUMERIC',
	DATE: 'DATE',
	PERIOD: 'PERIOD',
	BOOLEAN: 'BOOLEAN',
	ONE_OF_MANY: 'ONE_OF_MANY'
}

async function getAttributes(req, res) {
	try {
		const { q, category, type } = req.query
		const attributes = await prisma.attributeLibrary.findMany({
			where: {
				AND: [
					q ? { name: { contains: q, mode: 'insensitive' } } : {},
					category ? { category } : {},
					type && type !== 'ALL' ? { type } : {}
				]
			},
			orderBy: { name: 'asc' },
			take: 100
		})
		res.json(attributes)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
}

async function saveAttribute(req, res) {
	try {
		const { id } = req.params
		const { name, type, category, options, version } = req.body

		if (!name?.trim()) {
			return res.status(400).json({ error: 'Name is required' })
		}

		const data = {
			name: name.trim(),
			type: TYPE_MAP[type?.toUpperCase()] || 'TEXT',
			category: category?.trim() || 'CERTIFICATION',
			...(options !== undefined && {
				options: Array.isArray(options) ? options : []
			})
		}

		if (id) {
			const existing = await prisma.attributeLibrary.findUnique({
				where: { id }
			})
			if (!existing) return res.status(404).json({ error: 'Not found' })
			if (version !== undefined && existing.version !== version) {
				return res.status(409).json({ error: 'Version conflict' })
			}

			const updated = await prisma.attributeLibrary.update({
				where: { id },
				data: {
					...data,
					version: { increment: 1 }
				}
			})
			return res.json(updated)
		}

		const created = await prisma.attributeLibrary.create({ data })
		res.status(201).json(created)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
}

async function deleteAttribute(req, res) {
	try {
		const { id } = req.params

		await prisma.$transaction(async tx => {
			if (tx.attributeUsage) {
				await tx.attributeUsage.deleteMany({ where: { attributeId: id } })
			}
			await tx.attributeLibrary.delete({ where: { id } })
		})

		res.json({ success: true })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
}

router.get(['/', '/library'], requireAuth, getAttributes)
router.post(
	['/', '/library'],
	requireAuth,
	requireRecruiterOrAdmin,
	saveAttribute
)
router.put(
	['/:id', '/library/:id'],
	requireAuth,
	requireRecruiterOrAdmin,
	saveAttribute
)
router.delete('/:id', requireAuth, requireRecruiterOrAdmin, deleteAttribute)

export default router
