import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import usersRoutes from './routes/users.js'

dotenv.config()

const app = express()

// TODO:
app.use(
	cors({
		origin: 'https://cv-management-nu.vercel.app',
		credentials: true
	})
)

app.use(express.json())

app.use('/api/users', usersRoutes)

app.listen(5000, () => {
	console.log('Server is running')
})
