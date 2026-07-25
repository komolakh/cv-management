import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { AttributeLibrarySelector } from '@/components/AttributeSelector'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const positionSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	selectedAttributeIds: z.array(z.string()).default([]),
	maxProjects: z.coerce.number().min(1).max(10).default(1),
	tagsInput: z.string().optional()
})

export function PositionsDialog({
	isOpen,
	onOpenChange,
	editingPosition,
	handleCloseModal,
	createMutation,
	updateMutation,
	onSubmit
}) {
	const { t } = useTranslation()

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(positionSchema),
		defaultValues: {
			title: '',
			description: '',
			selectedAttributeIds: [],
			maxProjects: 1,
			tagsInput: ''
		}
	})

	useEffect(() => {
		if (editingPosition) {
			reset({
				title: editingPosition.title ?? '',
				description: editingPosition.description ?? '',
				selectedAttributeIds: editingPosition.selectedAttributeIds ?? [],
				maxProjects: editingPosition.maxProjects ?? 1,
				tagsInput: editingPosition.tagsInput ?? ''
			})
		} else {
			reset({
				title: '',
				description: '',
				selectedAttributeIds: [],
				maxProjects: 1,
				tagsInput: ''
			})
		}
	}, [editingPosition, isOpen, reset])

	const isPending = createMutation?.isPending || updateMutation?.isPending

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{editingPosition
							? t('positionsPage.dialog.editTitle')
							: t('positionsPage.dialog.createTitle')}
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<div className="space-y-1.5">
						<Label>{t('positionsPage.dialog.fieldName')}</Label>
						<Input
							placeholder={t('positionsPage.dialog.fieldNamePlaceholder')}
							{...register('title')}
						/>
						{errors.title && (
							<p className="text-destructive">{errors.title.message}</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label>{t('positionsPage.dialog.fieldDesc')}</Label>
						<Textarea
							placeholder={t('positionsPage.dialog.fieldDescPlaceholder')}
							{...register('description')}
						/>
						{errors.description && (
							<p className="text-destructive">{errors.description.message}</p>
						)}
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

					<div className="space-y-1.5">
						<Label>{t('positionsPage.dialog.fieldMaxProjects')}</Label>
						<Input
							type="number"
							className="text-sm h-9"
							{...register('maxProjects')}
						/>
					</div>
					<div className="space-y-1.5">
						<Label>{t('positionsPage.dialog.fieldTags')}</Label>
						<Input
							placeholder={t('positionsPage.dialog.fieldTagsPlaceholder')}
							{...register('tagsInput')}
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={handleCloseModal}
						>
							{t('positionsPage.dialog.btnCancel')}
						</Button>
						<Button
							type="submit"
							disabled={isPending}
						>
							{isPending && <Loader2 />}
							{t('positionsPage.dialog.btnSubmit')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
