import express from 'express'
import crypto from 'node:crypto'
import prisma from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

router.get('/position/:positionId', async (req, res) => {
	try {
		const { positionId } = req.params
		const userId = req.userId || req.auth?.userId
		if (!userId) return res.status(401).json({ error: 'Unauthorized' })

		const position = await prisma.position.findUnique({
			where: { id: positionId },
			include: {
				PositionTemplateAttribute: {
					include: {
						AttributeLibrary: true,
						attributeLibrary: true
					}
				}
			}
		})
		if (!position) return res.status(404).json({ error: 'Position not found' })

		let cv = await prisma.cV.findFirst({
			where: { userId, positionId },
			include: {
				position: true
			}
		})
		if (!cv) {
			cv = await prisma.cV.create({
				data: {
					id: crypto.randomUUID(),
					userId,
					positionId,
					status: 'DRAFT'
				},
				include: {
					position: true
				}
			})
		}

		const [candidateUser, userProfileAttrs, projects] = await Promise.all([
			prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					role: true
				}
			}),
			prisma.profileAttributeValue.findMany({
				where: {
					userId,
					attributeId: {
						in: position.PositionTemplateAttribute.map(p => p.attributeId)
					}
				}
			}),
			prisma.project.findMany({
				where: {
					userId,
					...(position.projectTags?.length
						? { tags: { hasSome: position.projectTags } }
						: {})
				},
				take: position.maxProjects || 3,
				orderBy: { startDate: 'desc' }
			})
		])

		const attributes = position.PositionTemplateAttribute.map(pta => ({
			id: pta.attributeId,
			attributeId: pta.attributeId,
			value:
				userProfileAttrs.find(pa => pa.attributeId === pta.attributeId)
					?.value || '',
			AttributeLibrary: pta.AttributeLibrary || pta.attributeLibrary
		}))

		res.json({
			cv,
			attributes,
			projects,
			maxProjects: position.maxProjects || 3,
			candidateInfo: candidateUser
		})
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
})

export default router
