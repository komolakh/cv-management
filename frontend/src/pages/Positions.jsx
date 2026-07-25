import { useAuth, useUser } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
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

	const { data: positions = [] } = useQuery({
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
	}

	const toggleSelectAll = () => {
		setSelectedPositionIds(
			selectedPositionIds.length === positions.length
				? []
				: positions.map(p => p.id)
		)
	}

	const toggleSelectRow = id => {
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
			setIsCreateOpen(true)
		}
	}

	const onSubmit = data => {
		const payload = {
			title: data.title?.trim() || '',
			shortDescription: data.description?.trim() || data.title?.trim() || '',
			maxProjects: Number(data.maxProjects) || 3,
			projectTags:
				typeof data.tagsInput === 'string' && data.tagsInput.trim() !== ''
					? data.tagsInput
							.split(',')
							.map(t => t.trim())
							.filter(Boolean)
					: [],
			accessRules: { isPublic: true },
			attributeIds: data.selectedAttributeIds || []
		}

		if (editingPosition) {
			updateMutation.mutate({ id: editingPosition.id, data: payload })
		} else {
			createMutation.mutate(payload)
		}
	}

	if (!isClerkLoaded || isRoleLoading) {
		return (
			<div className="flex h-48 items-center justify-center">
				<Loader2 className=" animate-spin " />
			</div>
		)
	}

	return (
		<div className="container mx-auto max-w-4xl p-6">
			<div className="flex items-center justify-between pb-10">
				<div>
					<h1 className="text-xl font-bold">{t('positionsPage.title')}</h1>
				</div>

				{isRecruiter && (
					<>
						<Button
							variant="outline"
							onClick={() => {
								setEditingPosition(null)
								setIsCreateOpen(true)
							}}
						>
							<Plus />
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
							onSubmit={onSubmit}
							createMutation={createMutation}
							updateMutation={updateMutation}
						/>
					</>
				)}
			</div>

			<div className="mb-5">
				<Input
					placeholder={t('positionsPage.searchPlaceholder')}
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
			</div>

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
		</div>
	)
}
