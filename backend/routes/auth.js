import express from 'express'
import prisma from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
router.use(requireAuth)

router.post('/sync', async (req, res) => {
	try {
		const id = req.auth?.userId
		let user = await prisma.user.findUnique({ where: { id } })

		if (!user) {
			const { firstName, lastName, emailAddresses } = req.body
			user = await prisma.user.create({
				data: {
					id,
					email: emailAddresses?.[0]?.emailAddress || null,
					firstName: firstName || null,
					lastName: lastName || null,
					role: 'CANDIDATE',
					version: 1
				}
			})
		}

		res.json({ success: true, user })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
})

export default router
