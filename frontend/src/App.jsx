import { useAuth, useUser } from '@clerk/clerk-react'
import {
	QueryClient,
	QueryClientProvider,
	useMutation,
	useQuery
} from '@tanstack/react-query'
import axios from 'axios'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { Header } from './components/Header'
import AdminPanel from './pages/AdminPanel'
import AttributeLibraryPage from './pages/AttributeLibrary'
import CvConstructor from './pages/CvConstructor'
import Home from './pages/Home'
import PositionsPage from './pages/Positions'
import ProfilePage from './pages/Profile'

const queryClient = new QueryClient({
	defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } }
})

axios.defaults.baseURL =
	import.meta.env.VITE_API_URL || 'https://cv-backend-cfbk.onrender.com'

function AuthAndSyncHandler() {
	const { getToken, isSignedIn, isLoaded: isAuthLoaded } = useAuth()
	const { user, isLoaded: isUserLoaded } = useUser()
	const { t } = useTranslation()

	useEffect(() => {
		const interceptor = axios.interceptors.request.use(async config => {
			try {
				if (isSignedIn) {
					const token = await getToken()
					if (token) config.headers.Authorization = `Bearer ${token}`
				}
			} catch (err) {
				console.error('Token error:', err)
			}
			return config
		})
		return () => axios.interceptors.request.eject(interceptor)
	}, [getToken, isSignedIn])

	const syncMutation = useMutation({
		mutationFn: userData => axios.post('/api/auth/sync', userData),
		onError: err =>
			console.error(t('sync.error'), err.response?.data || err.message)
	})

	useEffect(() => {
		if (
			isAuthLoaded &&
			isUserLoaded &&
			isSignedIn &&
			user &&
			syncMutation.isIdle
		) {
			syncMutation.mutate({
				firstName: user.firstName,
				lastName: user.lastName,
				emailAddresses:
					user.emailAddresses?.map(e => ({ emailAddress: e.emailAddress })) ||
					[]
			})
		}
	}, [isAuthLoaded, isUserLoaded, isSignedIn, user, syncMutation])

	return null
}

function MainLayout() {
	const { getToken, isLoaded, isSignedIn } = useAuth()

	const { data: dbUser } = useQuery({
		queryKey: ['currentUser'],
		queryFn: async () => {
			const token = await getToken()
			if (!token) return null

			const res = await axios.get('/api/users/me', {
				headers: { Authorization: `Bearer ${token}` }
			})
			return res.data?.user || null
		},
		enabled: isLoaded && isSignedIn,
		retry: 3,
		retryDelay: 1000,
		staleTime: 1000 * 60 * 5
	})

	const role = dbUser?.role
	const isAdmin = role === 'ADMINISTRATOR'
	const isStaff = isAdmin || role === 'RECRUITER'

	return (
		<Router>
			<AuthAndSyncHandler />
			<Header
				isStaff={isStaff}
				isAdmin={isAdmin}
			/>

			<main className="min-h-[calc(100vh-64px)] bg-slate-50/50 dark:bg-slate-950">
				<Routes>
					<Route
						path="/"
						element={<Home />}
					/>
					<Route
						path="/positions"
						element={<PositionsPage />}
					/>
					<Route
						path="/profile"
						element={<ProfilePage />}
					/>
					<Route
						path="/cv/:positionId"
						element={<CvConstructor />}
					/>
					<Route
						path="/attribute"
						element={<AttributeLibraryPage />}
					/>
					<Route
						path="/admin"
						element={<AdminPanel />}
					/>
				</Routes>
			</main>
		</Router>
	)
}

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<MainLayout />
		</QueryClientProvider>
	)
}
