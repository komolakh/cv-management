import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import prisma from '../db.js'

export const requireAuth = (req, res, next) => {
	ClerkExpressRequireAuth()(req, res, err => {
		if (err) return next(err)
		req.userId = req.auth?.userId
		next()
	})
}

export const requireAdmin = async (req, res, next) => {
	try {
		const userId = req.userId || req.auth?.userId
		const user = await prisma.user.findUnique({ where: { id: userId } })
		if (!user || user.role !== 'ADMINISTRATOR') {
			return res
				.status(403)
				.json({ error: 'Access denied: Required ADMINISTRATOR privileges' })
		}
		req.currentUser = user
		next()
	} catch (err) {
		return res.status(500).json({ error: 'Admin auth failed: ' + err.message })
	}
}

export const requireRecruiterOrAdmin = async (req, res, next) => {
	try {
		const userId = req.userId || req.auth?.userId
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, role: true }
		})
		if (!user || user.role === 'CANDIDATE') {
			return res.status(403).json({ error: 'Access denied' })
		}
		req.currentUser = user
		next()
	} catch (err) {
		return res.status(500).json({ error: err.message })
	}
}
