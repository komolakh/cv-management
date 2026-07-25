import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'

export function DataTable({
	data = [],
	columns = [],
	selectedIds = [],
	onSelectRow,
	onSelectAll,
	onRowClick,
	emptyMessage = 'No data found',
	isLoading = false,
	loadingComponent
}) {
	const isSelectable =
		typeof onSelectAll === 'function' && typeof onSelectRow === 'function'
	const isAllSelected =
		isSelectable && data.length > 0 && selectedIds.length === data.length

	if (isLoading) {
		return (
			loadingComponent || (
				<div className="flex h-48 items-center justify-center text-sm text-slate-400">
					Loading...
				</div>
			)
		)
	}

	if (data.length === 0) {
		return (
			<div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 text-sm">
				{emptyMessage}
			</div>
		)
	}

	return (
		<div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
			<Table>
				<TableHeader className="bg-slate-50 dark:bg-slate-950">
					<TableRow>
						{isSelectable && (
							<TableHead className="w-10 text-center">
								<input
									type="checkbox"
									checked={isAllSelected}
									onChange={onSelectAll}
									className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
								/>
							</TableHead>
						)}
						{columns.map((col, index) => (
							<TableHead
								key={index}
								className={`text-sm ${col.className || ''}`}
							>
								{col.header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map(row => {
						const isSelected = selectedIds.includes(row.id)
						return (
							<TableRow
								key={row.id}
								onClick={() => onRowClick?.(row)}
								className={`transition-colors ${
									onRowClick ? 'cursor-pointer' : ''
								} ${
									isSelected
										? 'bg-indigo-50/40 dark:bg-indigo-950/20'
										: 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
								}`}
							>
								{isSelectable && (
									<TableCell
										className="text-center"
										onClick={e => e.stopPropagation()}
									>
										<input
											type="checkbox"
											checked={isSelected}
											onChange={e => onSelectRow(row.id, e)}
											className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
										/>
									</TableCell>
								)}
								{columns.map((col, index) => (
									<TableCell
										key={index}
										className={col.cellClassName || ''}
									>
										{col.cell ? col.cell(row) : row[col.accessorKey]}
									</TableCell>
								))}
							</TableRow>
						)
					})}
				</TableBody>
			</Table>
		</div>
	)
}
