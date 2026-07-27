import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'

const projectSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	description: z.string().optional(),
	tagsInput: z.string().optional()
})

export function ProfileDialog({
	editingProject,
	setEditingProject,
	onSave,
	t
}) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			name: '',
			startDate: '',
			endDate: '',
			description: '',
			tagsInput: ''
		}
	})

	useEffect(() => {
		if (editingProject) {
			reset({
				name: editingProject.name ?? '',
				startDate: editingProject.startDate
					? editingProject.startDate.substring(0, 10)
					: '',
				endDate: editingProject.endDate
					? editingProject.endDate.substring(0, 10)
					: '',
				description: editingProject.description ?? '',
				tagsInput: Array.isArray(editingProject.tags)
					? editingProject.tags.join(', ')
					: ''
			})
		}
	}, [editingProject, reset])

	if (!editingProject) return null

	const handleFormSubmit = data => {
		const tags = data.tagsInput
			? data.tagsInput
					.split(',')
					.map(tag => tag.trim().toLowerCase())
					.filter(Boolean)
			: []

		onSave({
			...editingProject,
			name: data.name,
			startDate: data.startDate || null,
			endDate: data.endDate || null,
			description: data.description,
			tags
		})
	}

	return (
		<Dialog
			open={!!editingProject}
			onOpenChange={() => setEditingProject(null)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{editingProject.id
							? t('profile.dialog.editTitle')
							: t('profile.dialog.createTitle')}
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(handleFormSubmit)}
					className="space-y-4"
				>
					<div className="space-y-1.5">
						<Label>{t('profile.dialog.projectName')}</Label>
						<Input
							placeholder={t('profile.dialog.projectName')}
							{...register('name')}
						/>
						{errors.name && (
							<p className="text-destructive text-sm">{errors.name.message}</p>
						)}
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label>{t('profile.dialog.startDate')}</Label>
							<Input
								type="date"
								{...register('startDate')}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>{t('profile.dialog.endDate')}</Label>
							<Input
								type="date"
								{...register('endDate')}
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label>{t('profile.dialog.projectDesc')}</Label>
						<Textarea
							rows={4}
							placeholder={t('profile.dialog.projectDesc')}
							{...register('description')}
						/>
					</div>

					<div className="space-y-1.5">
						<Label>{t('profile.dialog.projectTags')}</Label>
						<Input
							placeholder="react, typescript, node.js"
							{...register('tagsInput')}
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setEditingProject(null)}
						>
							{t('profile.dialog.btnCancel')}
						</Button>
						<Button type="submit">{t('profile.dialog.btnSave')}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
