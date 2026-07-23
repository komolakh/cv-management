import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { AlertCircle, Loader2, Shield, User, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function AdminPanel() {
	const { t } = useTranslation()
	const { getToken, isLoaded, isSignedIn } = useAuth()
	const queryClient = useQueryClient()

	const {
		data: users = [],
		isLoading,
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
		enabled: isLoaded && isSignedIn
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
					message:
						err.response?.data?.error || err.message || t('admin.errorUpdate')
				})
			)
		}
	})

	const getRoleVariant = role => {
		switch (role) {
			case 'ADMINISTRATOR':
				return 'destructive'
			case 'RECRUITER':
				return 'default'
			default:
				return 'secondary'
		}
	}

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
				<Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
				<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
					{t('admin.loading')}
				</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="max-w-xl mx-auto mt-8 p-4">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>{t('admin.errorTitle', 'Ошибка')}</AlertTitle>
					<AlertDescription className="text-sm">
						{error.response?.data?.message ||
							error.message ||
							t('admin.fetchError')}
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className="container mx-auto max-w-5xl p-6 space-y-6">
			<Card className="border-slate-200 dark:border-slate-800 shadow-sm">
				<CardHeader className="border-b dark:border-slate-800 pb-4">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<CardTitle className="text-lg font-bold flex items-center gap-2">
								<Shield className="h-5 w-5 text-indigo-600" />
								{t('admin.title')}
							</CardTitle>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								{t(
									'admin.subtitle',
									'Управление пользователями и правами доступа'
								)}
							</p>
						</div>
						<Badge
							variant="outline"
							className="gap-1.5 px-3 py-1 text-sm"
						>
							<Users className="h-4 w-4" />
							<span>{users.length}</span>
						</Badge>
					</div>
				</CardHeader>

				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="bg-slate-50/50 dark:bg-slate-950/50">
								<TableHead className="text-sm">
									{t('admin.tableEmail')}
								</TableHead>
								<TableHead className="text-sm">
									{t('admin.tableName')}
								</TableHead>
								<TableHead className="text-sm">
									{t('admin.tableRole')}
								</TableHead>
								<TableHead className="text-sm text-right">
									{t('admin.tableAction')}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-center py-8 text-sm text-slate-500 dark:text-slate-400"
									>
										{t('admin.noUsers', 'Пользователи не найдены')}
									</TableCell>
								</TableRow>
							) : (
								users.map(user => {
									const isUpdating =
										roleMutation.isPending &&
										roleMutation.variables?.userId === user.id
									const fullName = `${user.firstName || ''} ${
										user.lastName || ''
									}`.trim()

									return (
										<TableRow
											key={user.id}
											className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
										>
											<TableCell className="font-medium text-sm">
												{user.email}
											</TableCell>
											<TableCell className="text-sm text-slate-600 dark:text-slate-400">
												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-slate-400" />
													<span>
														{fullName || t('admin.noName', 'Без имени')}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={getRoleVariant(user.role)}
													className="text-xs uppercase font-semibold"
												>
													{t(`admin.roles.${user.role}`, {
														defaultValue: user.role
													})}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end items-center">
													<Select
														disabled={isUpdating}
														value={user.role}
														onValueChange={newRole =>
															roleMutation.mutate({ userId: user.id, newRole })
														}
													>
														<SelectTrigger className="w-[160px] h-9 text-sm">
															{isUpdating ? (
																<Loader2 className="h-4 w-4 animate-spin mx-auto" />
															) : (
																<SelectValue />
															)}
														</SelectTrigger>
														<SelectContent align="end">
															{['CANDIDATE', 'RECRUITER', 'ADMINISTRATOR'].map(
																role => (
																	<SelectItem
																		key={role}
																		value={role}
																		className="text-sm"
																	>
																		{t(`admin.roles.${role}`)}
																	</SelectItem>
																)
															)}
														</SelectContent>
													</Select>
												</div>
											</TableCell>
										</TableRow>
									)
								})
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
