import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AttributeLibrarySelector } from '@/components/AttributeSelector'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function PositionsDialog({
	isOpen,
	onOpenChange,
	editingPosition,
	handleCloseModal,
	form,
	onSubmit,
	createMutation,
	updateMutation
}) {
	const { t } = useTranslation()
	const { register, handleSubmit, control } = form

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle className="text-base font-semibold">
						{editingPosition
							? 'Редактировать позицию'
							: t('positionsPage.dialog.title')}
					</DialogTitle>
					<DialogDescription className="text-sm text-slate-500">
						{t('positionsPage.dialog.description')}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4 py-2"
				>
					<div className="space-y-1.5">
						<label className="text-xs font-semibold uppercase text-slate-500">
							{t('positionsPage.dialog.fieldName')} *
						</label>
						<Input
							required
							placeholder={t('positionsPage.dialog.fieldNamePlaceholder')}
							{...register('title')}
							className="text-sm h-9"
						/>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-semibold uppercase text-slate-500">
							{t('positionsPage.dialog.fieldDesc')} *
						</label>
						<Textarea
							required
							placeholder={t('positionsPage.dialog.fieldDescPlaceholder')}
							{...register('shortDescription')}
							className="text-sm min-h-[80px]"
						/>
					</div>

					<Controller
						name="selectedAttributeIds"
						control={control}
						render={({ field }) => (
							<AttributeLibrarySelector
								selectedIds={field.value}
								onChange={field.onChange}
							/>
						)}
					/>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label className="text-xs font-semibold uppercase text-slate-500">
								{t('positionsPage.dialog.fieldMaxProjects')}
							</label>
							<Input
								type="number"
								min="1"
								max="10"
								{...register('maxProjects')}
								className="text-sm h-9"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-xs font-semibold uppercase text-slate-500">
								{t('positionsPage.dialog.fieldTags')}
							</label>
							<Input
								placeholder={t('positionsPage.dialog.fieldTagsPlaceholder')}
								{...register('tagsInput')}
								className="text-sm h-9"
							/>
						</div>
					</div>

					<DialogFooter className="pt-2">
						<Button
							type="button"
							variant="ghost"
							onClick={handleCloseModal}
							className="text-sm h-9"
						>
							{t('positionsPage.dialog.btnCancel')}
						</Button>
						<Button
							type="submit"
							disabled={createMutation.isPending || updateMutation.isPending}
							className="text-sm h-9"
						>
							{editingPosition
								? 'Сохранить'
								: t('positionsPage.dialog.btnSubmit')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
