import { useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/input'
import { Button } from './ui/button'

export function AttributeLibrarySelector({ selectedIds, onChange }) {
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
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-2">
				<span className="text-xs text-slate-500">
					{t('positionsPage.selector.selectedCount', {
						count: selectedIds.length
					})}
				</span>
			</div>

			<div>
				<Input
					placeholder={t('positionsPage.selector.searchPlaceholder')}
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
			</div>

			<div className="space-x-1 space-y-1">
				{!isLoading &&
					attributes.length > 0 &&
					attributes.map(attr => {
						const isSelected = selectedIds.includes(attr.id)
						return (
							<Button
								type="button"
								variant={!isSelected && 'secondary'}
								key={attr.id}
								onClick={() => toggleAttribute(attr.id)}
							>
								{attr.name}
								{isSelected && <Check className="h-4 w-4" />}
							</Button>
						)
					})}
			</div>
		</div>
	)
}
