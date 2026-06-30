import axios from 'axios'
import { useEffect, useState } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
// import Navbar from './components/Navbar'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import Home from './pages/Home'

// TODO:
axios.defaults.baseURL = 'https://cv-management-csia.onrender.com'

function App() {
	const [users, setUsers] = useState([])
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await axios.get('/api/users')
				setUsers(res.data.users)
				console.log(users)
			} catch (err) {
				console.log(err)
				setError("Couldn't get users")
			}
		}
		fetchUsers()
	}, [users])

	if (loading) {
		return <div>loading...</div>
	}

	if (error) {
		return <div>{error}</div>
	}

	return (
		<Router>
			{/* <Navbar /> */}
			<header>
				<Show when="signed-out">
					<SignInButton />
					<SignUpButton />
				</Show>
				<Show when="signed-in">
					<UserButton />
				</Show>
			</header>
			<Routes>
				<Route
					path="/"
					element={<Home />}
				/>
			</Routes>
		</Router>
	)
}

export default App
