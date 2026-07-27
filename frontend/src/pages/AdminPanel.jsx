import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Loader from '@/components/Loader'
import { Badge } from '@/components/ui/badge'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { useUserRole } from '@/hooks/useUserRole'

export default function AdminPanel() {
	const { t } = useTranslation()
	const { getToken, isLoaded, isSignedIn } = useAuth()
	const { isAdmin, isLoading: isRoleLoading } = useUserRole()
	const queryClient = useQueryClient()

	const {
		data: users = [],
		isLoading: isUsersLoading,
		error
	} = useQuery({
		queryKey: ['adminUsers'],
		queryFn: async () => {
			const token = await getToken()
			const res = await axios.get('/api/users', {
				headers: { Authorization: `Bearer ${token}` }
			})
			return res.data.users || res.data || []
		},
		enabled: isLoaded && isSignedIn && isAdmin
	})

	const roleMutation = useMutation({
		mutationFn: async ({ userId, newRole }) => {
			const token = await getToken()
			await axios.put(
				`/api/users/${userId}/role`,
				{ newRole },
				{ headers: { Authorization: `Bearer ${token}` } }
			)
			return { userId, newRole }
		},
		onSuccess: ({ userId, newRole }) => {
			queryClient.setQueryData(['adminUsers'], old =>
				old?.map(u => (u.id === userId ? { ...u, role: newRole } : u))
			)
		},
		onError: err => {
			alert(
				t('actions.errorLabel', {
					message: err.message
				})
			)
		}
	})

	if (isRoleLoading || isUsersLoading) {
		return <Loader />
	}

	return (
		<div className="container mx-auto max-w-5xl p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-xl">{t('admin.title')}</h1>
				<Badge variant="outline">
					<Users />
					{users.length}
				</Badge>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t('admin.tableEmail')}</TableHead>
						<TableHead className="font-semibold">
							{t('admin.tableName')}
						</TableHead>
						<TableHead className="font-semibold">
							{t('admin.tableRole')}
						</TableHead>
						<TableHead className="font-semibold">
							{t('admin.tableAction')}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.length > 0 &&
						users.map(user => {
							const isUpdating =
								roleMutation.isPending &&
								roleMutation.variables?.userId === user.id
							const fullName = `${user.firstName || ''} ${
								user.lastName || ''
							}`.trim()

							return (
								<TableRow key={user.id}>
									<TableCell>{user.email}</TableCell>
									<TableCell>{fullName}</TableCell>
									<TableCell>{user.role}</TableCell>
									<TableCell>
										<Select
											disabled={isUpdating}
											value={user.role}
											onValueChange={newRole =>
												roleMutation.mutate({ userId: user.id, newRole })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent align="end">
												{['CANDIDATE', 'RECRUITER', 'ADMINISTRATOR'].map(
													role => (
														<SelectItem
															key={role}
															value={role}
														>
															{role}
														</SelectItem>
													)
												)}
											</SelectContent>
										</Select>
									</TableCell>
								</TableRow>
							)
						})}
				</TableBody>
			</Table>
		</div>
	)
}
