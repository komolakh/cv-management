import { useAuth, useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
	Calendar,
	MapPin,
	MoreVertical,
	Plus,
	Trash2,
	User,
	X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const profileSchema = z.object({
	firstName: z.string().default(''),
	lastName: z.string().default(''),
	location: z.string().default(''),
	photoUrl: z.string().default(''),
	attrs: z.record(z.string(), z.string()).default({})
})

const SectionHeader = ({ title }) => (
	<h2 className="text-sm font-bold ">{title}</h2>
)

export default function ProfilePage() {
	const { isLoaded, isSignedIn } = useAuth()
	const { user: clerkUser } = useUser()
	const { t } = useTranslation()
	const queryClient = useQueryClient()

	const [editingProject, setEditingProject] = useState(null)
	const [selectedLibraryAttr, setSelectedLibraryAttr] = useState('')
	const [tagInput, setTagInput] = useState('')

	const { data: profileData, isLoading } = useQuery({
		queryKey: ['profile'],
		queryFn: async () => (await axios.get('/api/profile')).data,
		enabled: isLoaded && isSignedIn
	})

	const { data: libraryAttributes = [] } = useQuery({
		queryKey: ['attributeLibrary'],
		queryFn: async () =>
			(await axios.get('/api/attributes/library')).data || [],
		enabled: isLoaded && isSignedIn
	})

	const isReadOnly = profileData?.user?.role === 'RECRUITER'

	const { register, control, reset } = useForm({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			location: '',
			photoUrl: '',
			attrs: {}
		}
	})

	useEffect(() => {
		if (profileData) {
			const initialAttrs = {}
			profileData.userAttributes?.forEach(attr => {
				initialAttrs[attr.id] = attr.value || ''
			})
			reset({
				firstName: profileData.user?.firstName || clerkUser?.firstName || '',
				lastName: profileData.user?.lastName || clerkUser?.lastName || '',
				location: profileData.user?.location || '',
				photoUrl: profileData.user?.photoUrl || clerkUser?.imageUrl || '',
				attrs: initialAttrs
			})
		}
	}, [profileData, clerkUser, reset])

	const autoSaveMutation = useMutation({
		mutationFn: async values => {
			const { attrs, ...me } = values
			const res = await axios.put('/api/profile/autosave', {
				me,
				attributes: attrs,
				version: profileData?.user?.version || 1
			})
			return { newVersion: res.data.newVersion, updatedMe: me }
		},
		onSuccess: ({ newVersion, updatedMe }) => {
			queryClient.setQueryData(['profile'], old => {
				if (!old) return old
				return {
					...old,
					user: { ...old.user, ...updatedMe, version: newVersion }
				}
			})
		}
	})

	const watchedValues = useWatch({ control })
	const watchedString = JSON.stringify(watchedValues)

	useEffect(() => {
		if (isReadOnly || !profileData || !watchedValues) return
		const timer = setTimeout(() => {
			if (Object.keys(watchedValues).length > 0) {
				autoSaveMutation.mutate(watchedValues)
			}
		}, 3000)
		return () => clearTimeout(timer)
	}, [watchedString])

	const addAttrMutation = useMutation({
		mutationFn: async attributeId =>
			axios.post('/api/profile/attributes', { attributeId }),
		onSuccess: () => queryClient.invalidateQueries(['profile'])
	})

	const removeAttrMutation = useMutation({
		mutationFn: async attrId =>
			axios.delete(`/api/profile/attributes/${attrId}`),
		onSuccess: () => queryClient.invalidateQueries(['profile'])
	})

	const saveProjectMutation = useMutation({
		mutationFn: async project =>
			project.id
				? axios.put(`/api/projects/${project.id}`, project)
				: axios.post('/api/projects', project),
		onSuccess: () => {
			queryClient.invalidateQueries(['profile'])
			setEditingProject(null)
		}
	})

	const deleteProjectMutation = useMutation({
		mutationFn: async id => axios.delete(`/api/projects/${id}`),
		onSuccess: () => queryClient.invalidateQueries(['profile'])
	})

	if (!isLoaded || isLoading) {
		return (
			<div className="flex h-48 items-center justify-center text-xs text-slate-400">
				{t('profile.loading')}
			</div>
		)
	}

	const projects = profileData?.projects || []
	const cvs = profileData?.cvs || []

	return (
		<div className="container mx-auto max-w-2xl p-6 space-y-8 text-slate-900 dark:text-slate-100">
			<div className="flex items-center gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
				<div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
					{watchedValues?.photoUrl ? (
						<img
							src={watchedValues.photoUrl}
							alt="Avatar"
							className="h-full w-full object-cover"
						/>
					) : (
						<User className="h-8 w-8 text-slate-400" />
					)}
				</div>
				<div className="space-y-1.5">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold tracking-tight">
							{watchedValues?.firstName || t('profile.defaultFirstName')}{' '}
							{watchedValues?.lastName || t('profile.defaultLastName')}
						</h1>
						{profileData?.user?.role && (
							<Badge
								variant="secondary"
								className="text-xs font-medium px-2.5 py-0.5"
							>
								{profileData.user.role}
							</Badge>
						)}
					</div>
					<p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
						<MapPin className="h-4 w-4" />
						{watchedValues?.location || t('profile.noLocation')}
					</p>
				</div>
			</div>

			<div className="space-y-4">
				<SectionHeader title={t('profile.meSection', 'Me')} />
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Input
						{...register('firstName')}
						disabled={isReadOnly}
						placeholder={t('profile.firstNameLabel')}
						className="text-sm h-10"
					/>
					<Input
						{...register('lastName')}
						disabled={isReadOnly}
						placeholder={t('profile.lastNameLabel')}
						className="text-sm h-10"
					/>
				</div>
				<Input
					{...register('location')}
					disabled={isReadOnly}
					placeholder={t('profile.locationLabel')}
					className="text-sm h-10"
				/>
			</div>

			<div className="space-y-4 pt-2">
				<SectionHeader title={t('profile.infoSection', 'Info')} />

				{!isReadOnly && (
					<div className="flex gap-2">
						<select
							value={selectedLibraryAttr}
							onChange={e => setSelectedLibraryAttr(e.target.value)}
							className="flex-1 text-sm px-3 py-2 h-10 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent"
						>
							<option value="">
								{t('profile.selectAttributePlaceholder')}
							</option>
							{libraryAttributes.map(attr => (
								<option
									key={attr.id}
									value={attr.id}
								>
									{attr.name}
								</option>
							))}
						</select>
						<Button
							size="default"
							variant="outline"
							disabled={!selectedLibraryAttr}
							onClick={() => {
								addAttrMutation.mutate(selectedLibraryAttr)
								setSelectedLibraryAttr('')
							}}
							className="h-10 px-4 shrink-0"
						>
							<Plus className="h-4 w-4 mr-1.5" /> {t('profile.btnAdd')}
						</Button>
					</div>
				)}

				<div className="space-y-3">
					{profileData?.userAttributes?.map(attr => (
						<div
							key={attr.id}
							className="group flex items-center gap-2"
						>
							<div className="flex-1 space-y-1">
								<span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
									{attr.attributeLibrary?.name || attr.attribute?.name}
								</span>
								<Input
									{...register(`attrs.${attr.id}`)}
									disabled={isReadOnly}
									className="text-sm h-10"
								/>
							</div>
							{!isReadOnly && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() => removeAttrMutation.mutate(attr.id)}
									className="h-10 w-10 text-slate-400 hover:text-red-500 self-end"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4 pt-2">
				<div className="flex justify-between items-center">
					<SectionHeader title={t('profile.projectsSection', 'Projects')} />
					{!isReadOnly && (
						<Button
							size="sm"
							variant="outline"
							onClick={() =>
								setEditingProject({
									name: '',
									description: '',
									startDate: '',
									endDate: '',
									tags: []
								})
							}
							className="text-xs h-9 px-3"
						>
							<Plus className="h-3.5 w-3.5 mr-1.5" /> {t('profile.btnAdd')}
						</Button>
					)}
				</div>

				<div className="space-y-4">
					{projects.length === 0 ? (
						<p className="py-6 text-sm text-slate-400 text-center border border-dashed rounded-xl">
							{t('profile.noProjects')}
						</p>
					) : (
						projects.map(proj => (
							<div
								key={proj.id}
								className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 relative group bg-white dark:bg-slate-900/40 shadow-sm"
							>
								{!isReadOnly && (
									<div className="absolute top-4 right-4">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0 text-slate-400"
												>
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => setEditingProject(proj)}
												>
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => deleteProjectMutation.mutate(proj.id)}
													className="text-red-500"
												>
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								)}
								<h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 pr-8">
									{proj.name}
								</h3>
								<p className="text-xs text-slate-500 flex items-center gap-1.5">
									<Calendar className="h-3.5 w-3.5" />
									{proj.startDate
										? new Date(proj.startDate).toLocaleDateString()
										: ''}{' '}
									—{' '}
									{proj.endDate
										? new Date(proj.endDate).toLocaleDateString()
										: t('profile.presentDate')}
								</p>
								<div className="text-sm text-slate-700 dark:text-slate-300 prose dark:prose-invert max-w-none">
									<ReactMarkdown>{proj.description || ''}</ReactMarkdown>
								</div>
								{proj.tags?.length > 0 && (
									<div className="flex flex-wrap gap-1.5 pt-1">
										{proj.tags.map(tag => (
											<span
												key={tag}
												className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium"
											>
												#{tag}
											</span>
										))}
									</div>
								)}
							</div>
						))
					)}
				</div>
			</div>

			<div className="space-y-4 pt-2">
				<SectionHeader title={t('profile.cvsSection', 'CVs')} />
				<div className="space-y-3">
					{cvs.length === 0 ? (
						<p className="py-6 text-sm text-slate-400 text-center border border-dashed rounded-xl">
							{t('profile.noCvs')}
						</p>
					) : (
						cvs.map(cv => (
							<div
								key={cv.id}
								className="flex justify-between items-center p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/40 shadow-sm"
							>
								<div>
									<p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
										{cv.position?.title || t('profile.untitledPosition')}
									</p>
									<p className="text-xs text-slate-400 mt-0.5">
										{new Date(cv.createdAt).toLocaleDateString()}
									</p>
								</div>
								<Link to={`/cv/${cv.id}`}>
									<Button
										variant="outline"
										size="sm"
										className="text-xs h-9"
									>
										{t('profile.btnOpenCv')} →
									</Button>
								</Link>
							</div>
						))
					)}
				</div>
			</div>

			{editingProject && (
				<Dialog
					open={!!editingProject}
					onOpenChange={() => setEditingProject(null)}
				>
					<DialogContent className="sm:max-w-[440px]">
						<DialogHeader>
							<DialogTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
								{editingProject.id
									? t('profile.dialog.editTitle')
									: t('profile.dialog.createTitle')}
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4 py-2">
							<Input
								placeholder={t('profile.dialog.projectName')}
								value={editingProject.name}
								onChange={e =>
									setEditingProject(p => ({ ...p, name: e.target.value }))
								}
								className="text-sm h-10"
							/>
							<div className="grid grid-cols-2 gap-3">
								<Input
									type="date"
									value={editingProject.startDate?.substring(0, 10) || ''}
									onChange={e =>
										setEditingProject(p => ({
											...p,
											startDate: e.target.value
										}))
									}
									className="text-sm h-10"
								/>
								<Input
									type="date"
									value={editingProject.endDate?.substring(0, 10) || ''}
									onChange={e =>
										setEditingProject(p => ({ ...p, endDate: e.target.value }))
									}
									className="text-sm h-10"
								/>
							</div>
							<Textarea
								rows={4}
								placeholder="Description (Markdown supported)"
								value={editingProject.description}
								onChange={e =>
									setEditingProject(p => ({
										...p,
										description: e.target.value
									}))
								}
								className="text-sm font-mono resize-none"
							/>
							<div className="space-y-2">
								<Input
									placeholder="Add tag + Enter..."
									value={tagInput}
									onChange={e => setTagInput(e.target.value)}
									onKeyDown={e => {
										if (e.key === 'Enter' && tagInput.trim()) {
											e.preventDefault()
											const tag = tagInput.trim().toLowerCase()
											if (!editingProject.tags?.includes(tag)) {
												setEditingProject(p => ({
													...p,
													tags: [...(p.tags || []), tag]
												}))
											}
											setTagInput('')
										}
									}}
									className="text-sm h-10"
								/>
								<div className="flex flex-wrap gap-1.5">
									{editingProject.tags?.map(t => (
										<span
											key={t}
											className="inline-flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 font-medium"
										>
											#{t}
											<X
												className="h-3.5 w-3.5 cursor-pointer hover:text-red-500"
												onClick={() =>
													setEditingProject(p => ({
														...p,
														tags: p.tags.filter(tag => tag !== t)
													}))
												}
											/>
										</span>
									))}
								</div>
							</div>
						</div>

						<DialogFooter className="gap-2 sm:gap-0 pt-2">
							<Button
								variant="ghost"
								onClick={() => setEditingProject(null)}
								className="text-sm h-10"
							>
								{t('profile.dialog.btnCancel')}
							</Button>
							<Button
								onClick={() => saveProjectMutation.mutate(editingProject)}
								className="text-sm h-10"
							>
								{t('profile.dialog.btnSave')}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	)
}
