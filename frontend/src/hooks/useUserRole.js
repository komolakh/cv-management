import { useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export function useUserRole() {
	const { getToken, isLoaded, isSignedIn } = useAuth()

	const { data: dbUser, isLoading } = useQuery({
		queryKey: ['currentUser'],
		queryFn: async () => {
			const token = await getToken()
			if (!token) return null
			const res = await axios.get('/api/users/me', {
				headers: { Authorization: `Bearer ${token}` }
			})
			return res.data?.user
		},
		enabled: isLoaded && isSignedIn,
		staleTime: 1000 * 60 * 5
	})

	const role = dbUser?.role

	return {
		role,
		dbUser,
		isLoading,
		isAdmin: role === 'ADMINISTRATOR',
		isRecruiter: role === 'RECRUITER' || role === 'ADMINISTRATOR',
		isCandidate: role === 'CANDIDATE' || role === 'ADMINISTRATOR'
	}
}
