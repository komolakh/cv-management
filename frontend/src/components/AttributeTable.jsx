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
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from './ui/button'

export function AttributeTable({
	isRecruiter,
	filteredAttributes,
	selectedIds,
	toggleSelectAll,
	toggleSelectOne,
	handleEditSelected,
	handleBulkDelete
}) {
	const { t } = useTranslation()

	return (
		<div className="space-y-4">
			{isRecruiter && selectedIds.length > 0 && (
				<div className="dark:bg-slate-900 dark:text-white bg-zinc-50 text-slate-900 px-4 py-2.5 rounded-md flex items-center gap-2">
					{selectedIds.length === 1 && (
						<Button
							variant="outline"
							onClick={handleEditSelected}
						>
							<Pencil />
							{t('attributeLibrary.btnEditSelected')}
						</Button>
					)}
					<Button
						variant="destructive"
						onClick={handleBulkDelete}
					>
						<Trash2 />
						{t('attributeLibrary.btnDeleteSelected')}
					</Button>
				</div>
			)}

			<Table>
				<TableHeader>
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
						<TableHead className="font-semibold">
							{t('attributeLibrary.tableCategory')}
						</TableHead>
						<TableHead className="font-semibold">
							{t('attributeLibrary.tableName')}
						</TableHead>
						<TableHead className="font-semibold">
							{t('attributeLibrary.tableType')}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredAttributes.map(attr => {
						const isSelected = selectedIds.includes(attr.id)
						return (
							<TableRow key={attr.id}>
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
								<TableCell>{attr.category}</TableCell>
								<TableCell>{attr.name}</TableCell>
								<TableCell>
									<span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
										{attr.type}
									</span>
								</TableCell>
							</TableRow>
						)
					})}
				</TableBody>
			</Table>
		</div>
	)
}
