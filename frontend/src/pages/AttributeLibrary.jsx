import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Filter, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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

const ATTRIBUTE_TYPES = [
	'STRING',
	'TEXT',
	'IMAGE',
	'NUMERIC',
	'DATE',
	'PERIOD',
	'BOOLEAN',
	'ONE_OF_MANY'
]

const CATEGORIES = [
	'CERTIFICATION',
	'DOMAIN_KNOWLEDGE',
	'PERSONAL_INFORMATION',
	'SOFT_SKILLS'
]

const INITIAL_FORM_DATA = {
	name: '',
	type: 'STRING',
	category: 'CERTIFICATION'
}

export default function AttributeLibraryPage() {
	const { t } = useTranslation()
	const { getToken, isLoaded, isSignedIn } = useAuth()
	const queryClient = useQueryClient()

	const [searchQuery, setSearchQuery] = useState('')
	const [selectedType, setSelectedType] = useState('ALL')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingAttribute, setEditingAttribute] = useState(null)
	const [selectedIds, setSelectedIds] = useState([])
	const [formData, setFormData] = useState(INITIAL_FORM_DATA)

	const { data: profileData } = useQuery({
		queryKey: ['profile'],
		queryFn: async () => {
			const token = await getToken()
			const res = await axios.get('/api/profile', {
				headers: { Authorization: `Bearer ${token}` }
			})
			return res.data
		},
		enabled: isLoaded && isSignedIn
	})

	const role = profileData?.user?.role || 'CANDIDATE'
	const isAdmin = role === 'ADMINISTRATOR' || role === 'RECRUITER'

	const { data: attributes = [], isLoading } = useQuery({
		queryKey: ['attributes'],
		queryFn: async () => {
			const token = await getToken()
			const res = await axios.get('/api/attributes', {
				headers: { Authorization: `Bearer ${token}` }
			})
			return res.data || []
		},
		enabled: isLoaded && isSignedIn
	})

	const saveMutation = useMutation({
		mutationFn: async data => {
			const token = await getToken()
			const headers = { Authorization: `Bearer ${token}` }
			const url = editingAttribute?.id
				? `/api/attributes/${editingAttribute.id}`
				: '/api/attributes'
			const method = editingAttribute?.id ? 'put' : 'post'
			const res = await axios[method](url, data, { headers })
			return res.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['attributes'] })
			setIsModalOpen(false)
		},
		onError: err => {
			console.log(err)
		}
	})

	const handleBulkDelete = async () => {
		if (
			!confirm(
				t('attributeLibrary.confirmDeleteBulk') || 'Delete selected items?'
			)
		)
			return
		try {
			const token = await getToken()
			await Promise.all(
				selectedIds.map(id =>
					axios.delete(`/api/attributes/${id}`, {
						headers: { Authorization: `Bearer ${token}` }
					})
				)
			)
			queryClient.invalidateQueries({ queryKey: ['attributes'] })
			setSelectedIds([])
		} catch (err) {
			console.log(err)
		}
	}

	const handleOpenModal = (attr = null) => {
		setEditingAttribute(attr)
		setFormData({
			name: attr?.name ?? INITIAL_FORM_DATA.name,
			type: attr?.type ?? INITIAL_FORM_DATA.type,
			category: attr?.category ?? INITIAL_FORM_DATA.category
		})
		setIsModalOpen(true)
	}

	const handleEditSelected = () => {
		if (selectedIds.length !== 1) return
		const targetAttr = attributes.find(a => a.id === selectedIds[0])
		if (targetAttr) {
			handleOpenModal(targetAttr)
		}
	}

	const filteredAttributes = attributes.filter(attr => {
		const matchesSearch = attr.name
			?.toLowerCase()
			.includes(searchQuery.toLowerCase())
		const matchesType = selectedType === 'ALL' || attr.type === selectedType
		return matchesSearch && matchesType
	})

	const toggleSelectAll = () => {
		if (selectedIds.length === filteredAttributes.length) {
			setSelectedIds([])
		} else {
			setSelectedIds(filteredAttributes.map(a => a.id))
		}
	}

	const toggleSelectOne = id => {
		setSelectedIds(prev =>
			prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
		)
	}

	if (isLoading || !isLoaded) {
		return (
			<div className="flex h-48 items-center justify-center text-sm text-slate-400">
				<Loader2 className="h-5 w-5 animate-spin mr-2" />
				{t('attributeLibrary.loading')}
			</div>
		)
	}

	return (
		<div className="container mx-auto max-w-4xl p-6 space-y-6 text-slate-900 dark:text-slate-100">
			<div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
				<h1 className="text-xl font-bold">{t('attributeLibrary.title')}</h1>
				{isAdmin && (
					<Button
						onClick={() => handleOpenModal()}
						size="sm"
						variant="outline"
						className="text-sm h-9 px-3"
					>
						<Plus className="h-4 w-4 mr-1.5" />
						{t('attributeLibrary.btnAdd')}
					</Button>
				)}
			</div>

			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
					<Input
						placeholder={t('attributeLibrary.searchPlaceholder')}
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className="pl-9 text-sm h-9"
					/>
				</div>
				<div className="w-full sm:w-[180px]">
					<Select
						value={selectedType}
						onValueChange={setSelectedType}
					>
						<SelectTrigger className="text-sm h-9">
							<Filter className="h-4 w-4 mr-2 text-slate-400" />
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem
								value="ALL"
								className="text-sm"
							>
								{t('attributeLibrary.filterAllTypes')}
							</SelectItem>
							{ATTRIBUTE_TYPES.map(type => (
								<SelectItem
									key={type}
									value={type}
									className="text-sm"
								>
									{type}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{isAdmin && selectedIds.length > 0 && (
				<div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
					<span className="text-xs font-medium text-slate-600 dark:text-slate-300">
						{selectedIds.length} {t('attributeLibrary.selectedCount')}
					</span>
					<div className="flex items-center gap-2">
						{selectedIds.length === 1 && (
							<Button
								variant="outline"
								size="sm"
								onClick={handleEditSelected}
								className="h-8 text-xs px-2.5 bg-white dark:bg-slate-900"
							>
								<Pencil className="h-3.5 w-3.5 mr-1.5" />
								{t('attributeLibrary.btnEditSelected')}
							</Button>
						)}
						<Button
							variant="destructive"
							size="sm"
							onClick={handleBulkDelete}
							className="h-8 text-xs px-2.5"
						>
							<Trash2 className="h-3.5 w-3.5 mr-1.5" />
							{t('attributeLibrary.btnDeleteSelected')}
						</Button>
					</div>
				</div>
			)}

			<div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
				<Table>
					<TableHeader className="bg-slate-50 dark:bg-slate-950">
						<TableRow>
							{isAdmin && (
								<TableHead className="w-10 pl-4">
									<Checkbox
										checked={
											filteredAttributes.length > 0 &&
											selectedIds.length === filteredAttributes.length
										}
										onCheckedChange={toggleSelectAll}
									/>
								</TableHead>
							)}
							<TableHead className="text-sm">Категория</TableHead>
							<TableHead className="text-sm">
								{t('attributeLibrary.tableName')}
							</TableHead>
							<TableHead className="text-sm">
								{t('attributeLibrary.tableType')}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredAttributes.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={isAdmin ? 4 : 3}
									className="text-center py-8 text-sm text-slate-400"
								>
									{t('attributeLibrary.noData')}
								</TableCell>
							</TableRow>
						) : (
							filteredAttributes.map(attr => {
								const isSelected = selectedIds.includes(attr.id)
								return (
									<TableRow
										key={attr.id}
										className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
										onClick={() => {
											if (isAdmin) {
												toggleSelectOne(attr.id)
											}
										}}
									>
										{isAdmin && (
											<TableCell
												className="w-10 pl-4"
												onClick={e => e.stopPropagation()}
											>
												<Checkbox
													checked={isSelected}
													onCheckedChange={() => toggleSelectOne(attr.id)}
												/>
											</TableCell>
										)}
										<TableCell className="text-sm text-slate-600 dark:text-slate-400 font-medium">
											{attr.category}
										</TableCell>
										<TableCell className="font-medium text-sm">
											{attr.name}
										</TableCell>
										<TableCell>
											<span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
												{attr.type}
											</span>
										</TableCell>
									</TableRow>
								)
							})
						)}
					</TableBody>
				</Table>
			</div>

			<Dialog
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
			>
				<DialogContent className="sm:max-w-[420px]">
					<DialogHeader>
						<DialogTitle className="text-base font-semibold">
							{editingAttribute
								? t('attributeLibrary.dialogEditTitle')
								: t('attributeLibrary.dialogCreateTitle')}
						</DialogTitle>
					</DialogHeader>

					<form
						onSubmit={e => {
							e.preventDefault()
							isAdmin && saveMutation.mutate(formData)
						}}
						className="space-y-4 py-2"
					>
						<div className="space-y-1.5">
							<label className="text-xs font-semibold uppercase text-slate-500">
								Категория
							</label>
							<Select
								value={formData.category}
								onValueChange={val =>
									setFormData(p => ({ ...p, category: val }))
								}
							>
								<SelectTrigger className="text-sm h-9">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map(cat => (
										<SelectItem
											key={cat}
											value={cat}
											className="text-sm"
										>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-semibold uppercase text-slate-500">
								{t('attributeLibrary.labelName')} *
							</label>
							<Input
								required
								value={formData.name}
								onChange={e =>
									setFormData(p => ({ ...p, name: e.target.value }))
								}
								placeholder="e.g. English Level"
								className="text-sm h-9"
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-semibold uppercase text-slate-500">
								{t('attributeLibrary.labelType')} *
							</label>
							<Select
								value={formData.type}
								onValueChange={val => setFormData(p => ({ ...p, type: val }))}
							>
								<SelectTrigger className="text-sm h-9">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{ATTRIBUTE_TYPES.map(type => (
										<SelectItem
											key={type}
											value={type}
											className="text-sm"
										>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setIsModalOpen(false)}
								className="text-sm h-9"
							>
								{t('attributeLibrary.btnCancel')}
							</Button>
							<Button
								type="submit"
								disabled={saveMutation.isPending}
								className="text-sm h-9"
							>
								{saveMutation.isPending && (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								)}
								{t('attributeLibrary.btnSave')}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
