import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2, Plus } from 'lucide-react'
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
			<div className="flex h-48 items-center justify-center">
				<Loader2 className=" animate-spin " />
			</div>
		)
	}

	return (
		<div className="container mx-auto max-w-6xl p-6">
			<div className="flex items-center justify-between pb-10">
				<h1 className="text-xl font-bold">{t('attributeLibrary.title')}</h1>
				{isRecruiter && (
					<>
						<Button
							onClick={() => handleOpenModal()}
							variant="outline"
						>
							<Plus />
							{t('attributeLibrary.btnAdd')}
						</Button>

						<AttributeDialog
							isModalOpen={isModalOpen}
							setIsModalOpen={setIsModalOpen}
							editingAttribute={editingAttribute}
							isRecruiter={isRecruiter}
							categories={CATEGORIES}
							attributeTypes={ATTRIBUTE_TYPES}
							saveMutation={saveMutation}
							onSubmit={data => saveMutation.mutate(data)}
						/>
					</>
				)}
			</div>

			<div className="flex flex-col sm:flex-row gap-3 mb-5">
				<div className="relative flex-1">
					<Input
						placeholder={t('attributeLibrary.searchPlaceholder')}
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
					/>
				</div>
				<div>
					<Select
						value={selectedType}
						onValueChange={setSelectedType}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">
								{t('attributeLibrary.filterAllTypes')}
							</SelectItem>
							{ATTRIBUTE_TYPES.map(type => (
								<SelectItem
									key={type}
									value={type}
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
		</div>
	)
}
