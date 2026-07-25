import { useAuth, useUser } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Copy, Edit2, Globe, Lock, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AttributeLibrarySelector } from '@/components/AttributeSelector'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useUserRole } from '@/hooks/useUserRole'

export default function PositionsPage() {
	const { getToken, isLoaded, isSignedIn } = useAuth()
	const { isLoaded: isClerkLoaded } = useUser()
	const { isRecruiter, isAdmin, isLoading: isRoleLoading } = useUserRole()
	const { t } = useTranslation()
	const queryClient = useQueryClient()

	const [search, setSearch] = useState('')
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [selectedPositionIds, setSelectedPositionIds] = useState([])

	const [editingPosition, setEditingPosition] = useState(null)

	const { register, handleSubmit, control, reset } = useForm({
		defaultValues: {
			title: '',
			shortDescription: '',
			maxProjects: 3,
			tagsInput: '',
			selectedAttributeIds: []
		}
	})

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

	const isRecruiterOrAdmin = isRecruiter || isAdmin

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

				{isRecruiterOrAdmin && (
					<Dialog
						open={isCreateOpen}
						onOpenChange={open => {
							if (!open) handleCloseModal()
							else setIsCreateOpen(true)
						}}
					>
						<DialogTrigger asChild>
							<Button
								size="sm"
								variant="outline"
								className="text-sm h-9 px-3"
							>
								<Plus className="h-4 w-4 mr-1.5" />
								{t('positionsPage.btnCreate')}
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[520px]">
							<DialogHeader>
								<DialogTitle className="text-base font-semibold">
									{editingPosition
										? 'Редактировать позицию'
										: t('positionsPage.dialog.title')}
								</DialogTitle>
								<DialogDescription className="text-sm text-slate-500">
									{t('positionsPage.dialog.description')}
								</DialogDescription>
							</DialogHeader>

							<form
								onSubmit={handleSubmit(onSubmit)}
								className="space-y-4 py-2"
							>
								<div className="space-y-1.5">
									<label className="text-xs font-semibold uppercase text-slate-500">
										{t('positionsPage.dialog.fieldName')} *
									</label>
									<Input
										required
										placeholder={t('positionsPage.dialog.fieldNamePlaceholder')}
										{...register('title')}
										className="text-sm h-9"
									/>
								</div>

								<div className="space-y-1.5">
									<label className="text-xs font-semibold uppercase text-slate-500">
										{t('positionsPage.dialog.fieldDesc')} *
									</label>
									<Textarea
										required
										placeholder={t('positionsPage.dialog.fieldDescPlaceholder')}
										{...register('shortDescription')}
										className="text-sm min-h-[80px]"
									/>
								</div>

								<Controller
									name="selectedAttributeIds"
									control={control}
									render={({ field }) => (
										<AttributeLibrarySelector
											selectedIds={field.value}
											onChange={field.onChange}
										/>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<label className="text-xs font-semibold uppercase text-slate-500">
											{t('positionsPage.dialog.fieldMaxProjects')}
										</label>
										<Input
											type="number"
											min="1"
											max="10"
											{...register('maxProjects')}
											className="text-sm h-9"
										/>
									</div>
									<div className="space-y-1.5">
										<label className="text-xs font-semibold uppercase text-slate-500">
											{t('positionsPage.dialog.fieldTags')}
										</label>
										<Input
											placeholder={t(
												'positionsPage.dialog.fieldTagsPlaceholder'
											)}
											{...register('tagsInput')}
											className="text-sm h-9"
										/>
									</div>
								</div>

								<DialogFooter className="pt-2">
									<Button
										type="button"
										variant="ghost"
										onClick={handleCloseModal}
										className="text-sm h-9"
									>
										{t('positionsPage.dialog.btnCancel')}
									</Button>
									<Button
										type="submit"
										disabled={
											createMutation.isPending || updateMutation.isPending
										}
										className="text-sm h-9"
									>
										{editingPosition
											? 'Сохранить'
											: t('positionsPage.dialog.btnSubmit')}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
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

			{selectedPositionIds.length > 0 && isRecruiterOrAdmin && (
				<div className="sticky top-4 z-20 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-md flex items-center justify-between">
					<span className="text-xs font-medium">
						{t('positionsPage.toolbar.selectedCount', {
							count: selectedPositionIds.length
						})}
					</span>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="ghost"
							onClick={() => duplicateMutation.mutate(selectedPositionIds)}
							disabled={duplicateMutation.isPending}
							className="h-8 text-xs gap-1 hover:bg-slate-800 dark:hover:bg-slate-200"
						>
							<Copy className="h-3.5 w-3.5" />
							{t('positionsPage.toolbar.btnDuplicate')}
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onClick={() =>
								confirm(t('positionsPage.deleteConfirm')) &&
								deleteMutation.mutate(selectedPositionIds)
							}
							disabled={deleteMutation.isPending}
							className="h-8 text-xs gap-1 text-red-400 hover:text-red-300 hover:bg-red-950/50"
						>
							<Trash2 className="h-3.5 w-3.5" />
							{t('positionsPage.toolbar.btnDelete')}
						</Button>
					</div>
				</div>
			)}

			{isPositionsLoading ? (
				<div className="flex h-48 items-center justify-center text-sm text-slate-400">
					{t('positionsPage.loading')}
				</div>
			) : positions.length === 0 ? (
				<div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 text-sm">
					{t('positionsPage.noPositionsFound')}
				</div>
			) : (
				<div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
					<Table>
						<TableHeader className="bg-slate-50 dark:bg-slate-950">
							<TableRow>
								<TableHead className="w-10 text-center">
									<input
										type="checkbox"
										checked={
											selectedPositionIds.length === positions.length &&
											positions.length > 0
										}
										onChange={toggleSelectAll}
										className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
									/>
								</TableHead>
								<TableHead className="text-sm">
									{t('positionsPage.tableColTitle')}
								</TableHead>
								<TableHead className="text-sm">
									{t('positionsPage.tableColDesc')}
								</TableHead>
								<TableHead className="text-sm">
									{t('positionsPage.tableColAccess')}
								</TableHead>
								<TableHead className="text-sm">
									{t('positionsPage.tableColTags')}
								</TableHead>
								<TableHead className="text-sm">
									{t('positionsPage.tableColAttrs')}
								</TableHead>
								<TableHead className="w-16 text-right"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{positions.map(pos => {
								const isSelected = selectedPositionIds.includes(pos.id)
								return (
									<TableRow
										key={pos.id}
										onClick={() => (window.location.href = `/cv/${pos.id}`)}
										className={`cursor-pointer transition-colors ${
											isSelected
												? 'bg-indigo-50/40 dark:bg-indigo-950/20'
												: 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
										}`}
									>
										<TableCell
											className="text-center"
											onClick={e => e.stopPropagation()}
										>
											<input
												type="checkbox"
												checked={isSelected}
												onChange={e => toggleSelectRow(pos.id, e)}
												className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
											/>
										</TableCell>

										<TableCell className="font-semibold text-sm">
											{pos.title}
										</TableCell>
										<TableCell className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
											{pos.shortDescription}
										</TableCell>

										<TableCell>
											<Badge
												variant={
													pos.accessRules?.isPublic
														? 'secondary'
														: 'destructive'
												}
												className="text-[10px] py-0.5 px-2 font-medium gap-1 uppercase"
											>
												{pos.accessRules?.isPublic ? (
													<Globe className="h-3 w-3" />
												) : (
													<Lock className="h-3 w-3" />
												)}
												{pos.accessRules?.isPublic ? 'Public' : 'Restricted'}
											</Badge>
										</TableCell>

										<TableCell>
											<div className="flex flex-wrap gap-1 max-w-[150px]">
												{pos.projectTags?.map(tag => (
													<span
														key={tag}
														className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded"
													>
														#{tag}
													</span>
												))}
											</div>
										</TableCell>

										<TableCell>
											<div className="flex flex-wrap gap-1 max-w-[150px]">
												{pos.templateAttributes?.map(pta => (
													<span
														key={pta.attributeId}
														className="text-xs font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded"
													>
														{pta.attributeLibrary?.name}
													</span>
												))}
											</div>
										</TableCell>

										<TableCell
											className="text-right"
											onClick={e => e.stopPropagation()}
										>
											{isRecruiterOrAdmin && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white"
													onClick={() => setEditingPosition(pos)}
												>
													<Edit2 className="h-4 w-4" />
												</Button>
											)}
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	)
}
