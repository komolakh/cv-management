import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Filter, Loader2, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AttributeDialog } from '@/components/AttributeDialog'
import { AttributeTable } from '@/components/AttributeTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { useUserRole } from '@/hooks/useUserRole'

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
	const { isRecruiter, isLoading: isRoleLoading } = useUserRole()
	const queryClient = useQueryClient()

	const [searchQuery, setSearchQuery] = useState('')
	const [selectedType, setSelectedType] = useState('ALL')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingAttribute, setEditingAttribute] = useState(null)
	const [selectedIds, setSelectedIds] = useState([])
	const [formData, setFormData] = useState(INITIAL_FORM_DATA)

	const { data: attributes = [], isLoading: isAttributesLoading } = useQuery({
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

	if (isRoleLoading || isAttributesLoading || !isLoaded) {
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
				{isRecruiter && (
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

			<AttributeTable
				isRecruiter={isRecruiter}
				filteredAttributes={filteredAttributes}
				selectedIds={selectedIds}
				toggleSelectAll={toggleSelectAll}
				toggleSelectOne={toggleSelectOne}
				handleEditSelected={handleEditSelected}
				handleBulkDelete={handleBulkDelete}
			/>

			<AttributeDialog
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				editingAttribute={editingAttribute}
				isRecruiter={isRecruiter}
				formData={formData}
				setFormData={setFormData}
				categories={CATEGORIES}
				attributeTypes={ATTRIBUTE_TYPES}
				saveMutation={saveMutation}
				onSubmit={data => saveMutation.mutate(data)}
			/>
		</div>
	)
}
