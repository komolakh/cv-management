import express from 'express'
import pool from '../config/db.js'

const router = express.Router()

/**
 * important: User registration endpoint
 */
router.post('/register', async (req, res) => {
	const { name, email, password } = req.body

	try {
		const hashedPassword = await bcrypt.hash(password, 10)

		const verificationToken = crypto.randomBytes(32).toString('hex')

		// note: DB UNIQUE INDEX handles duplicate emails
		const { rows } = await pool.query(
			`INSERT INTO users (name, email, password, status, verification_token) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, status, last_login_time`,
			[name, email, hashedPassword, 'unverified', verificationToken]
		)
		const user = rows[0]

		const token = generateToken(user.id)

		const verificationLink = `https://user-management-eight-gold.vercel.app/verify-email?token=${verificationToken}`

		// nota bene: Email is sent asynchronously
		sendEmail(
			user.email,
			'Verify Your Email Address',
			`Click the link to activate your account: ${verificationLink}`
		).catch(err => {
			console.error(err.message)
		})

		return res.status(201).json({
			user,
			token,
			message: 'Registration successful! Check your email.'
		})
	} catch (err) {
		return res.status(err.code === '23505' ? 409 : 400).json({
			message:
				err.code === '23505'
					? 'User with this email already exists'
					: 'Registration failed.'
		})
	}
})

export default router
