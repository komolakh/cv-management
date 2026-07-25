import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'

export function AttributeDialog({
	isModalOpen,
	setIsModalOpen,
	editingAttribute,
	isRecruiter,
	formData,
	setFormData,
	categories,
	attributeTypes,
	saveMutation,
	onSubmit
}) {
	const { t } = useTranslation()

	return (
		<Dialog
			open={isModalOpen}
			onOpenChange={setIsModalOpen}
		>
			<DialogContent className="sm:max-w-[420px]">
				<DialogHeader>
					<DialogTitle className="text-base font-semibold">
						{editingAttribute
							? t('attributeLibrary.dialogEditTitle')
							: t('attributeLibrary.dialogCreateTitle')}
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault()
						isRecruiter && onSubmit(formData)
					}}
					className="space-y-4 py-2"
				>
					<div className="space-y-1.5">
						<label className="text-xs font-semibold uppercase text-slate-500">
							{t('attributeLibrary.labelCategory')}
						</label>
						<Select
							value={formData.category}
							onValueChange={val => setFormData(p => ({ ...p, category: val }))}
						>
							<SelectTrigger className="text-sm h-9">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{categories.map(cat => (
									<SelectItem
										key={cat}
										value={cat}
										className="text-sm"
									>
										{cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-semibold uppercase text-slate-500">
							{t('attributeLibrary.labelName')}
						</label>
						<Input
							required
							value={formData.name}
							onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
							placeholder="e.g. English Level"
							className="text-sm h-9"
						/>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-semibold uppercase text-slate-500">
							{t('attributeLibrary.labelType')}
						</label>
						<Select
							value={formData.type}
							onValueChange={val => setFormData(p => ({ ...p, type: val }))}
						>
							<SelectTrigger className="text-sm h-9">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{attributeTypes.map(type => (
									<SelectItem
										key={type}
										value={type}
										className="text-sm"
									>
										{type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<DialogFooter className="pt-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsModalOpen(false)}
							className="text-sm h-9"
						>
							{t('attributeLibrary.btnCancel')}
						</Button>
						<Button
							type="submit"
							disabled={saveMutation.isPending}
							className="text-sm h-9"
						>
							{saveMutation.isPending && (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							)}
							{t('attributeLibrary.btnSave')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
