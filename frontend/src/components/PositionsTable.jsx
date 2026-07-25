import { Copy, Edit2, Globe, Lock, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'

export function PositionsTable({
	positions,
	selectedPositionIds,
	toggleSelectAll,
	toggleSelectRow,
	isRecruiter,
	handleEditSelected,
	duplicateMutation,
	deleteMutation
}) {
	const { t } = useTranslation()

	if (positions.length === 0) {
		return (
			<div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 text-sm">
				{t('positionsPage.noPositionsFound')}
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{selectedPositionIds.length > 0 && isRecruiter && (
				<div className="sticky top-4 z-20 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-md flex items-center justify-between">
					<span className="text-xs font-medium">
						{t('positionsPage.toolbar.selectedCount', {
							count: selectedPositionIds.length
						})}
					</span>
					<div className="flex items-center gap-2">
						{selectedPositionIds.length === 1 && (
							<Button
								size="sm"
								variant="ghost"
								onClick={handleEditSelected}
								className="h-8 text-xs gap-1 hover:bg-slate-800 dark:hover:bg-slate-200"
							>
								<Edit2 className="h-3.5 w-3.5" />
								Редактировать
							</Button>
						)}
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
										{pos.description}
									</TableCell>

									<TableCell>
										<Badge
											variant={
												pos.accessRules?.isPublic ? 'secondary' : 'destructive'
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
		</div>
	)
}
