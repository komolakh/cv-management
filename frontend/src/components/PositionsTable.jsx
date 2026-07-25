import { Copy, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

	return (
		<div className="space-y-4">
			{selectedPositionIds.length > 0 && isRecruiter && (
				<div className="dark:bg-slate-900 dark:text-white bg-zinc-50 text-slate-900 px-4 py-2.5 rounded-md flex items-center gap-2">
					{selectedPositionIds.length === 1 && (
						<Button
							variant="outline"
							onClick={handleEditSelected}
						>
							<Pencil />
							{t('positionsPage.toolbar.btnEdit')}
						</Button>
					)}
					<Button
						variant="outline"
						onClick={() => duplicateMutation.mutate(selectedPositionIds)}
						disabled={duplicateMutation.isPending}
					>
						<Copy />
						{t('positionsPage.toolbar.btnDuplicate')}
					</Button>

					<Button
						variant="destructive"
						onClick={() => deleteMutation.mutate(selectedPositionIds)}
						disabled={deleteMutation.isPending}
					>
						<Trash2 />
						{t('positionsPage.toolbar.btnDelete')}
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
										selectedPositionIds.length === positions.length &&
										positions.length > 0
									}
									onCheckedChange={toggleSelectAll}
								/>
							</TableHead>
						)}
						<TableHead>{t('positionsPage.tableColTitle')}</TableHead>
						<TableHead>{t('positionsPage.tableColDesc')}</TableHead>
						<TableHead>{t('positionsPage.tableColTags')}</TableHead>
						<TableHead>{t('positionsPage.tableColAttrs')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{positions.map(pos => {
						const isSelected = selectedPositionIds.includes(pos.id)
						return (
							<TableRow
								key={pos.id}
								onClick={() => (window.location.href = `/cv/${pos.id}`)}
								className="cursor-pointer "
							>
								{isRecruiter && (
									<TableCell
										className="w-10 pl-4"
										onClick={e => e.stopPropagation()}
									>
										<Checkbox
											checked={isSelected}
											onCheckedChange={() => toggleSelectRow(pos.id)}
										/>
									</TableCell>
								)}
								<TableCell>{pos.title}</TableCell>
								<TableCell>{pos.description}</TableCell>

								<TableCell>
									<div className="flex flex-wrap gap-1">
										{pos.projectTags?.map(tag => (
											<Badge key={tag}>{tag}</Badge>
										))}
									</div>
								</TableCell>

								<TableCell>
									<div className="flex flex-wrap gap-1">
										{pos.templateAttributes?.map(pta => (
											<Badge key={pta.attributeId}>
												{pta.attributeLibrary?.name}
											</Badge>
										))}
									</div>
								</TableCell>
							</TableRow>
						)
					})}
				</TableBody>
			</Table>
		</div>
	)
}
