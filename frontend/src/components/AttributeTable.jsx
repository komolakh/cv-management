import { useTranslation } from 'react-i18next'

import { Checkbox } from '@/components/ui/checkbox'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'

export function AttributeTable({
	isRecruiter,
	filteredAttributes,
	selectedIds,
	toggleSelectAll,
	toggleSelectOne
}) {
	const { t } = useTranslation()

	return (
		<div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
			<Table>
				<TableHeader className="bg-slate-50 dark:bg-slate-950">
					<TableRow>
						{isRecruiter && (
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
								colSpan={isRecruiter ? 4 : 3}
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
										if (isRecruiter) {
											toggleSelectOne(attr.id)
										}
									}}
								>
									{isRecruiter && (
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
	)
}
