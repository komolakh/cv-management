import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ProfileDialog({
	editingProject,
	setEditingProject,
	onSave,
	t
}) {
	const [tagInput, setTagInput] = useState('')
	const [localProject, setLocalProject] = useState(editingProject)

	useEffect(() => {
		setLocalProject(editingProject)
	}, [editingProject])

	if (!localProject) return null

	const handleAddTag = e => {
		if (e.key === 'Enter' && tagInput.trim()) {
			e.preventDefault()
			const tag = tagInput.trim().toLowerCase()
			if (!localProject.tags?.includes(tag)) {
				setLocalProject(p => ({
					...p,
					tags: [...(p.tags || []), tag]
				}))
			}
			setTagInput('')
		}
	}

	const handleRemoveTag = tagToRemove => {
		setLocalProject(p => ({
			...p,
			tags: p.tags.filter(tag => tag !== tagToRemove)
		}))
	}

	return (
		<Dialog
			open={!!editingProject}
			onOpenChange={() => setEditingProject(null)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{localProject.id
							? t('profile.dialog.editTitle')
							: t('profile.dialog.createTitle')}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<Input
						placeholder={t('profile.dialog.projectName')}
						value={localProject.name || ''}
						onChange={e =>
							setLocalProject(p => ({ ...p, name: e.target.value }))
						}
					/>
					<div className="grid grid-cols-2 gap-3">
						<Input
							type="date"
							value={localProject.startDate?.substring(0, 10) || ''}
							onChange={e =>
								setLocalProject(p => ({ ...p, startDate: e.target.value }))
							}
						/>
						<Input
							type="date"
							value={localProject.endDate?.substring(0, 10) || ''}
							onChange={e =>
								setLocalProject(p => ({ ...p, endDate: e.target.value }))
							}
						/>
					</div>
					<Textarea
						rows={4}
						placeholder={t('profile.dialog.projectDesc')}
						value={localProject.description || ''}
						onChange={e =>
							setLocalProject(p => ({ ...p, description: e.target.value }))
						}
					/>
					<div className="space-y-2">
						<Input
							placeholder={t('profile.dialog.projectTags')}
							value={tagInput}
							onChange={e => setTagInput(e.target.value)}
							onKeyDown={handleAddTag}
						/>
						<div className="flex flex-wrap gap-1.5">
							{localProject.tags?.map(t => (
								<Badge
									key={t}
									variant="secondary"
								>
									{t}
									<X onClick={() => handleRemoveTag(t)} />
								</Badge>
							))}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="ghost"
						onClick={() => setEditingProject(null)}
					>
						{t('profile.dialog.btnCancel')}
					</Button>
					<Button onClick={() => onSave(localProject)}>
						{t('profile.dialog.btnSave')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
