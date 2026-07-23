import { clerkMiddleware } from '@clerk/express'
import cors from 'cors'
import express from 'express'

import attributeRoutes from './routes/attributes.js'
import authRoutes from './routes/auth.js'
import cvRoutes from './routes/cvs.js'
import positionRoutes from './routes/positions.js'
import profileRouter from './routes/profile.js'
import projectsRouter from './routes/projects.js'
import userRoutes from './routes/users.js'

const app = express()

app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`)
	next()
})

const allowedOrigins = ['', 'http://localhost:5173']

app.use(
	cors({
		origin: (origin, callback) => {
			if (
				!origin ||
				allowedOrigins.includes(origin) ||
				origin.endsWith('.vercel.app')
			) {
				callback(null, true)
			} else {
				callback(new Error('Not allowed by CORS'))
			}
		},
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
	})
)

app.use(express.json({ limit: '10mb' }))

app.use(clerkMiddleware())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/attributes', attributeRoutes)
app.use('/api/positions', positionRoutes)
app.use('/api/cvs', cvRoutes)
app.use('/api/profile', profileRouter)
app.use('/api/projects', projectsRouter)

app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
	res.status(404).json({ error: `${req.originalUrl} not found.` })
})

app.use((err, req, res, next) => {
	res.status(err.status || 500).json({
		error: err.message
	})
})

const PORT = process.env.PORT || 10000

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server ${PORT}`)
})
