import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import prisma from '../db.js'

const getUserId = req => req.userId || req.auth?.userId

export const requireAuth = (req, res, next) => {
	ClerkExpressRequireAuth()(req, res, err => {
		if (err) return next(err)
		req.userId = req.auth?.userId
		next()
	})
}

const requireRole = allowedRoles => async (req, res, next) => {
	try {
		const userId = getUserId(req)
		const user = await prisma.user.findUnique({ where: { id: userId } })

		if (!user || !allowedRoles.includes(user.role)) {
			return res.status(403).json({ error: 'Access denied' })
		}

		req.currentUser = user
		next()
	} catch (err) {
		return res.status(500).json({ error: err.message })
	}
}

export const requireAdmin = requireRole(['ADMINISTRATOR'])

export const requireRecruiterOrAdmin = requireRole([
	'RECRUITER',
	'ADMINISTRATOR'
])
