import { useAuth, useUser } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
	Check,
	Copy,
	Globe,
	Lock,
	Plus,
	Search,
	Tag,
	Trash2
} from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

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

function AttributeLibrarySelector({ selectedIds, onChange }) {
	const { getToken, isLoaded, isSignedIn } = useAuth()
	const { t } = useTranslation()
	const [search, setSearch] = useState('')

	const { data: attributes = [], isLoading } = useQuery({
		queryKey: ['attributes', search],
		queryFn: async () => {
			const token = await getToken()
			const res = await axios.get(
				`/api/attributes?search=${encodeURIComponent(search)}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			)
			return res.data || []
		},
		enabled: isLoaded && isSignedIn,
		staleTime: 30000
	})

	const toggleAttribute = id => {
		onChange(
			selectedIds.includes(id)
				? selectedIds.filter(item => item !== id)
				: [...selectedIds, id]
		)
	}

	return (
		<div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/50">
			<div className="flex items-center justify-between gap-2">
				<label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
					<Tag className="h-3 w-3 text-indigo-500" />
					{t('positionsPage.selector.title')}
				</label>
				<span className="text-[10px] text-slate-400">
					{t('positionsPage.selector.selectedCount', {
						count: selectedIds.length
					})}
				</span>
			</div>

			<div className="relative">
				<Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
				<Input
					placeholder={t('positionsPage.selector.searchPlaceholder')}
					value={search}
					onChange={e => setSearch(e.target.value)}
					className="pl-8 text-xs h-8 bg-white dark:bg-slate-950"
				/>
			</div>

			<div className="max-h-[120px] overflow-y-auto space-y-1">
				{isLoading ? (
					<div className="text-xs text-slate-400 py-2 text-center">
						{t('positionsPage.selector.loading')}
					</div>
				) : attributes.length === 0 ? (
					<div className="text-xs text-slate-400 py-2 text-center">
						{t('positionsPage.selector.empty')}
					</div>
				) : (
					attributes.map(attr => {
						const isSelected = selectedIds.includes(attr.id)
						return (
							<button
								type="button"
								key={attr.id}
								onClick={() => toggleAttribute(attr.id)}
								className={`w-full flex items-center justify-between p-1.5 rounded text-left text-xs transition-colors ${
									isSelected
										? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
										: 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800'
								}`}
							>
								<span>{attr.name}</span>
								{isSelected && (
									<Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
								)}
							</button>
						)
					})
				)}
			</div>
		</div>
	)
}

export default function PositionsPage() {
	const { getToken, isLoaded, isSignedIn } = useAuth()
	const { isLoaded: isClerkLoaded } = useUser()
	const { t } = useTranslation()
	const queryClient = useQueryClient()

	const [search, setSearch] = useState('')
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [selectedPositionIds, setSelectedPositionIds] = useState([])

	const { register, handleSubmit, control, reset } = useForm({
		defaultValues: {
			title: '',
			shortDescription: '',
			maxProjects: 3,
			tagsInput: '',
			selectedAttributeIds: []
		}
	})

	const { data: dbUser, isLoading: isUserLoading } = useQuery({
		queryKey: ['currentUser'],
		queryFn: async () => {
			const token = await getToken()
			const res = await axios.get('/api/users/me', {
				headers: { Authorization: `Bearer ${token}` }
			})
			return res.data?.user || null
		},
		enabled: isLoaded && isSignedIn
	})

	const isRecruiterOrAdmin =
		dbUser?.role === 'RECRUITER' || dbUser?.role === 'ADMINISTRATOR'

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
			setIsCreateOpen(false)
			reset()
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
		createMutation.mutate({
			title: data.title.trim(),
			shortDescription: data.shortDescription.trim() || data.title.trim(),
			maxProjects: Number(data.maxProjects) || 3,
			projectTags: data.tagsInput
				.split(',')
				.map(t => t.trim())
				.filter(Boolean),
			accessRules: { isPublic: true },
			attributeIds: data.selectedAttributeIds
		})
	}

	if (!isClerkLoaded || isUserLoading) {
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
						onOpenChange={setIsCreateOpen}
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
									{t('positionsPage.dialog.title')}
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
										onClick={() => setIsCreateOpen(false)}
										className="text-sm h-9"
									>
										{t('positionsPage.dialog.btnCancel')}
									</Button>
									<Button
										type="submit"
										disabled={createMutation.isPending}
										className="text-sm h-9"
									>
										{t('positionsPage.dialog.btnSubmit')}
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
