import { useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Check, Search, Tag } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/input'

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
