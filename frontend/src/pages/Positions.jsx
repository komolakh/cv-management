import { useAuth, useUser } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { PositionsDialog } from '@/components/PositionsDialog'
import { PositionsTable } from '@/components/PositionsTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserRole } from '@/hooks/useUserRole'

export default function PositionsPage() {
	const { getToken, isLoaded, isSignedIn } = useAuth()
	const { isLoaded: isClerkLoaded } = useUser()
	const { isRecruiter, isLoading: isRoleLoading } = useUserRole()
	const { t } = useTranslation()
	const queryClient = useQueryClient()

	const [search, setSearch] = useState('')
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [selectedPositionIds, setSelectedPositionIds] = useState([])
	const [editingPosition, setEditingPosition] = useState(null)

	const form = useForm({
		defaultValues: {
			title: '',
			shortDescription: '',
			maxProjects: 3,
			tagsInput: '',
			selectedAttributeIds: []
		}
	})

	const { handleSubmit, reset } = form

	useEffect(() => {
		if (editingPosition) {
			reset({
				title: editingPosition.title || '',
				shortDescription: editingPosition.shortDescription || '',
				maxProjects: editingPosition.maxProjects || 3,
				tagsInput: editingPosition.projectTags
					? editingPosition.projectTags.join(', ')
					: '',
				selectedAttributeIds:
					editingPosition.templateAttributes?.map(a => a.attributeId) || []
			})
			setIsCreateOpen(true)
		}
	}, [editingPosition, reset])

	const { data: positions = [], isLoading: isPositionsLoading } = useQuery({
		queryKey: ['positions', search],
		queryFn: async () => {
			const token = await getToken()
			const res = await axios.get(
				`/api/positions?search=${encodeURIComponent(search)}`,
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			)
			return res.data || []
		},
		enabled: isLoaded && isSignedIn
	})

	const createMutation = useMutation({
		mutationFn: async newPosData => {
			const token = await getToken()
			await axios.post('/api/positions', newPosData, {
				headers: { Authorization: `Bearer ${token}` }
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['positions'] })
			handleCloseModal()
		},
		onError: err => alert(err.response?.data?.error || err.message)
	})

	const updateMutation = useMutation({
		mutationFn: async ({ id, data }) => {
			const token = await getToken()
			await axios.put(`/api/positions/${id}`, data, {
				headers: { Authorization: `Bearer ${token}` }
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['positions'] })
			handleCloseModal()
			setSelectedPositionIds([])
		},
		onError: err => alert(err.response?.data?.error || err.message)
	})

	const duplicateMutation = useMutation({
		mutationFn: async ids => {
			const token = await getToken()
			await Promise.all(
				ids.map(id =>
					axios.post(
						`/api/positions/${id}/duplicate`,
						{},
						{
							headers: { Authorization: `Bearer ${token}` }
						}
					)
				)
			)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['positions'] })
			setSelectedPositionIds([])
		}
	})

	const deleteMutation = useMutation({
		mutationFn: async ids => {
			const token = await getToken()
			await Promise.all(
				ids.map(id =>
					axios.delete(`/api/positions/${id}`, {
						headers: { Authorization: `Bearer ${token}` }
					})
				)
			)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['positions'] })
			setSelectedPositionIds([])
		}
	})

	const handleCloseModal = () => {
		setIsCreateOpen(false)
		setEditingPosition(null)
		reset({
			title: '',
			shortDescription: '',
			maxProjects: 3,
			tagsInput: '',
			selectedAttributeIds: []
		})
	}

	const toggleSelectAll = () => {
		setSelectedPositionIds(
			selectedPositionIds.length === positions.length
				? []
				: positions.map(p => p.id)
		)
	}

	const toggleSelectRow = (id, e) => {
		e.stopPropagation()
		setSelectedPositionIds(
			selectedPositionIds.includes(id)
				? selectedPositionIds.filter(item => item !== id)
				: [...selectedPositionIds, id]
		)
	}

	const handleEditSelected = () => {
		if (selectedPositionIds.length !== 1) return
		const posToEdit = positions.find(p => p.id === selectedPositionIds[0])
		if (posToEdit) {
			setEditingPosition(posToEdit)
		}
	}

	const onSubmit = data => {
		const payload = {
			title: data.title.trim(),
			shortDescription: data.shortDescription.trim() || data.title.trim(),
			maxProjects: Number(data.maxProjects) || 3,
			projectTags: data.tagsInput
				.split(',')
				.map(t => t.trim())
				.filter(Boolean),
			accessRules: { isPublic: true },
			attributeIds: data.selectedAttributeIds
		}

		if (editingPosition) {
			updateMutation.mutate({ id: editingPosition.id, data: payload })
		} else {
			createMutation.mutate(payload)
		}
	}

	if (!isClerkLoaded || isRoleLoading) {
		return (
			<div className="flex h-48 items-center justify-center text-sm text-slate-400">
				{t('positionsPage.loading')}
			</div>
		)
	}

	return (
		<div className="container mx-auto max-w-6xl p-6 space-y-6 text-slate-900 dark:text-slate-100">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
				<div>
					<h1 className="text-xl font-bold flex items-center gap-2">
						{t('positionsPage.title')}
					</h1>
				</div>

				{isRecruiter && (
					<div>
						<Button
							size="sm"
							variant="outline"
							className="text-sm h-9 px-3"
							onClick={() => {
								setEditingPosition(null)
								setIsCreateOpen(true)
							}}
						>
							<Plus className="h-4 w-4 mr-1.5" />
							{t('positionsPage.btnCreate')}
						</Button>

						<PositionsDialog
							isOpen={isCreateOpen}
							onOpenChange={open => {
								if (!open) handleCloseModal()
								else setIsCreateOpen(true)
							}}
							editingPosition={editingPosition}
							handleCloseModal={handleCloseModal}
							form={form}
							onSubmit={onSubmit}
							createMutation={createMutation}
							updateMutation={updateMutation}
						/>
					</div>
				)}
			</div>

			<div className="relative max-w-sm">
				<Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
				<Input
					placeholder={t('positionsPage.searchPlaceholder')}
					value={search}
					onChange={e => setSearch(e.target.value)}
					className="pl-9 text-sm h-9"
				/>
			</div>

			{isPositionsLoading ? (
				<div className="flex h-48 items-center justify-center text-sm text-slate-400">
					{t('positionsPage.loading')}
				</div>
			) : (
				<PositionsTable
					positions={positions}
					selectedPositionIds={selectedPositionIds}
					toggleSelectAll={toggleSelectAll}
					toggleSelectRow={toggleSelectRow}
					isRecruiter={isRecruiter}
					handleEditSelected={handleEditSelected}
					duplicateMutation={duplicateMutation}
					deleteMutation={deleteMutation}
				/>
			)}
		</div>
	)
}
