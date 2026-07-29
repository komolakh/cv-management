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
import { useNavigate } from 'react-router-dom'

export function PositionsTable({
	positions,
	selectedPositionIds,
	toggleSelectAll,
	toggleSelectRow,
	isRecruiter,
	isCandidate,
	isAdmin,
	handleEditSelected,
	duplicateMutation,
	deleteMutation
}) {
	const { t } = useTranslation()
	const navigate = useNavigate()

	return (
		<div className="space-y-4">
			{selectedPositionIds.length > 0 && isRecruiter && (
				<div className="px-4 py-2.5 rounded-md flex items-center gap-2">
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
						<TableHead className="font-semibold">
							{t('positionsPage.tableColTitle')}
						</TableHead>
						<TableHead className="font-semibold">
							{t('positionsPage.tableColDesc')}
						</TableHead>
						<TableHead className="font-semibold">
							{t('positionsPage.tableColTags')}
						</TableHead>
						<TableHead className="font-semibold">
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
								onClick={() =>
									isCandidate && !isAdmin
										? navigate(`/cv/${pos.id}`)
										: navigate(`/cvs/${pos.id}`)
								}
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
											<Badge
												key={tag}
												variant="secondary"
											>
												{tag}
											</Badge>
										))}
									</div>
								</TableCell>

								<TableCell>
									<div className="flex flex-wrap gap-1">
										{pos.templateAttributes?.map(pta => (
											<Badge
												key={pta.attributeId}
												variant="secondary"
											>
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
