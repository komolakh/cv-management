import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
	AlertCircle,
	Edit2,
	Filter,
	Loader2,
	Plus,
	Search,
	Trash2
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
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

const ATTRIBUTE_TYPES = ['TEXT', 'NUMERIC', 'BOOLEAN', 'SELECT']
const CATEGORIES = ['GENERAL', 'SKILLS', 'LANGUAGES', 'EXPERIENCE']

export default function AttributeLibraryPage() {
	const { t } = useTranslation()
	const { getToken, isLoaded, isSignedIn } = useAuth()
	const queryClient = useQueryClient()

	const [searchQuery, setSearchQuery] = useState('')
	const [selectedType, setSelectedType] = useState('ALL')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingAttribute, setEditingAttribute] = useState(null)
	const [formData, setFormData] = useState({
		name: '',
		key: '',
		type: 'TEXT',
		category: 'GENERAL',
		description: ''
	})

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

	const {
		data: attributes = [],
		isLoading,
		error
	} = useQuery({
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
			alert(
				err.response?.data?.error ||
					err.message ||
					t('attributeLibrary.saveError')
			)
		}
	})

	const deleteMutation = useMutation({
		mutationFn: async id => {
			const token = await getToken()
			await axios.delete(`/api/attributes/${id}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['attributes'] }),
		onError: err =>
			alert(
				err.response?.data?.error ||
					err.message ||
					t('attributeLibrary.deleteError')
			)
	})

	const handleOpenModal = (attr = null) => {
		setEditingAttribute(attr)
		setFormData(
			attr
				? {
						name: attr.name || '',
						key: attr.key || '',
						type: attr.type || 'TEXT',
						category: attr.category || 'GENERAL',
						description: attr.description || ''
				  }
				: {
						name: '',
						key: '',
						type: 'TEXT',
						category: 'GENERAL',
						description: ''
				  }
		)
		setIsModalOpen(true)
	}

	const filteredAttributes = attributes.filter(attr => {
		const matchesSearch =
			attr.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			attr.key?.toLowerCase().includes(searchQuery.toLowerCase())
		const matchesType = selectedType === 'ALL' || attr.type === selectedType
		return matchesSearch && matchesType
	})

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

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle className="text-sm">
						{t('attributeLibrary.errorTitle')}
					</AlertTitle>
					<AlertDescription className="text-sm">
						{error.response?.data?.error ||
							error.response?.data?.message ||
							error.message ||
							t('attributeLibrary.fetchError')}
					</AlertDescription>
				</Alert>
			)}

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

			<div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
				<Table>
					<TableHeader className="bg-slate-50 dark:bg-slate-950">
						<TableRow>
							<TableHead className="text-sm">
								{t('attributeLibrary.tableName')}
							</TableHead>
							<TableHead className="text-sm">
								{t('attributeLibrary.tableKey')}
							</TableHead>
							<TableHead className="text-sm">
								{t('attributeLibrary.tableType')}
							</TableHead>
							<TableHead className="text-sm">
								{t('attributeLibrary.tableDescription')}
							</TableHead>
							{isAdmin && (
								<TableHead className="text-sm text-right">
									{t('attributeLibrary.tableActions')}
								</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredAttributes.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={isAdmin ? 5 : 4}
									className="text-center py-8 text-sm text-slate-400"
								>
									{t('attributeLibrary.noData')}
								</TableCell>
							</TableRow>
						) : (
							filteredAttributes.map(attr => (
								<TableRow
									key={attr.id}
									className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
								>
									<TableCell className="font-medium text-sm">
										{attr.name}
									</TableCell>
									<TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
										{attr.key}
									</TableCell>
									<TableCell>
										<span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
											{attr.type}
										</span>
									</TableCell>
									<TableCell className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
										{attr.description || '—'}
									</TableCell>
									{isAdmin && (
										<TableCell className="text-right">
											<div className="flex justify-end gap-1">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleOpenModal(attr)}
													className="h-8 w-8 p-0"
												>
													<Edit2 className="h-4 w-4 text-slate-500" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														confirm(t('attributeLibrary.confirmDelete')) &&
														deleteMutation.mutate(attr.id)
													}
													className="h-8 w-8 p-0 hover:text-red-600"
												>
													<Trash2 className="h-4 w-4 text-slate-500" />
												</Button>
											</div>
										</TableCell>
									)}
								</TableRow>
							))
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
						<DialogDescription className="text-sm text-slate-500">
							{t('attributeLibrary.dialogDescription')}
						</DialogDescription>
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
								{t('attributeLibrary.labelKey')} *
							</label>
							<Input
								required
								value={formData.key}
								onChange={e =>
									setFormData(p => ({ ...p, key: e.target.value }))
								}
								placeholder="e.g. english_level"
								className="text-sm font-mono h-9"
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
								{t('attributeLibrary.labelDescription')}
							</label>
							<Input
								value={formData.description}
								onChange={e =>
									setFormData(p => ({ ...p, description: e.target.value }))
								}
								placeholder="..."
								className="text-sm h-9"
							/>
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
