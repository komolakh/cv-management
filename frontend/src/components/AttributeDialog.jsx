import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'

const attributeSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	type: z.string().min(1, 'Type is required'),
	category: z.string().min(1, 'Category is required')
})

export function AttributeDialog({
	isModalOpen,
	setIsModalOpen,
	editingAttribute,
	isRecruiter,
	categories,
	attributeTypes,
	saveMutation,
	onSubmit
}) {
	const { t } = useTranslation()

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(attributeSchema),
		defaultValues: {
			name: '',
			type: 'STRING',
			category: 'CERTIFICATION'
		}
	})

	useEffect(() => {
		if (editingAttribute) {
			reset({
				name: editingAttribute.name ?? '',
				type: editingAttribute.type ?? 'STRING',
				category: editingAttribute.category ?? 'CERTIFICATION'
			})
		} else {
			reset({
				name: '',
				type: 'STRING',
				category: 'CERTIFICATION'
			})
		}
	}, [editingAttribute, isModalOpen, reset])

	const onFormSubmit = data => {
		if (isRecruiter) {
			onSubmit(data)
		}
	}

	return (
		<Dialog
			open={isModalOpen}
			onOpenChange={setIsModalOpen}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{editingAttribute
							? t('attributeLibrary.dialogEditTitle')
							: t('attributeLibrary.dialogCreateTitle')}
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(onFormSubmit)}
					className="space-y-4"
				>
					<div className="space-y-1.5">
						<Label>{t('attributeLibrary.labelCategory')}</Label>
						<Controller
							name="category"
							control={control}
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									value={field.value}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{categories.map(cat => (
											<SelectItem
												key={cat}
												value={cat}
											>
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.category && (
							<p className="text-destructive">{errors.category.message}</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label>{t('attributeLibrary.labelName')}</Label>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									placeholder="e.g. English Level"
								/>
							)}
						/>
						{errors.name && (
							<p className="text-destructive">{errors.name.message}</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label>{t('attributeLibrary.labelType')}</Label>
						<Controller
							name="type"
							control={control}
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									value={field.value}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{attributeTypes.map(type => (
											<SelectItem
												key={type}
												value={type}
											>
												{type}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.type && (
							<p className="text-destructive">{errors.type.message}</p>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsModalOpen(false)}
						>
							{t('attributeLibrary.btnCancel')}
						</Button>
						<Button
							type="submit"
							disabled={saveMutation.isPending}
						>
							{saveMutation.isPending && <Loader2 />}
							{t('attributeLibrary.btnSave')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
