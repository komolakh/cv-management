import express from 'express'
import pool from '../config/db.js'

const router = express.Router()

/**
 * important: Get all users sorted by latest login
 */
router.get('/', async (req, res) => {
	try {
		const { rows } = await pool.query('SELECT id, name FROM users')
		res.json({ users: rows })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

export default router
