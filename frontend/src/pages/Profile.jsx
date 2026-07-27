import { useAuth, useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
	Calendar,
	Loader2,
	MapPin,
	MoreVertical,
	Plus,
	Trash2,
	User
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { ProfileDialog } from '@/components/ProfileDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useUserRole } from '@/hooks/useUserRole'

const profileSchema = z.object({
	firstName: z.string().default(''),
	lastName: z.string().default(''),
	location: z.string().default(''),
	photoUrl: z.string().default(''),
	attrs: z.record(z.string(), z.string()).default({})
})

export default function ProfilePage() {
	const { isLoaded, isSignedIn } = useAuth()
	const { user: clerkUser, isLoaded: isClerkLoaded } = useUser()
	const { isRecruiter, isAdmin, isLoading: isRoleLoading } = useUserRole()
	const { t } = useTranslation()
	const queryClient = useQueryClient()

	const [editingProject, setEditingProject] = useState(null)
	const [selectedLibraryAttr, setSelectedLibraryAttr] = useState('')

	const { data: profileData, isLoading } = useQuery({
		queryKey: ['profile'],
		queryFn: async () => (await axios.get('/api/profile')).data,
		enabled: isLoaded && isSignedIn
	})

	const { data: libraryAttributes = [] } = useQuery({
		queryKey: ['attributeLibrary'],
		queryFn: async () => (await axios.get('/api/attributes')).data || [],
		enabled: isLoaded && isSignedIn
	})

	const isReadOnly = isRecruiter && !isAdmin

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

	if (!isClerkLoaded || isRoleLoading || isLoading) {
		return (
			<div className="flex h-48 items-center justify-center">
				<Loader2 className=" animate-spin " />
			</div>
		)
	}

	const projects = profileData?.projects || []
	const cvs = profileData?.cvs || []

	return (
		<div className="container mx-auto max-w-4xl p-6">
			<div className="flex items-center gap-5 pb-6 border-b">
				<div className="h-20 w-20 rounded-full overflow-hidden">
					{watchedValues?.photoUrl ? (
						<img
							src={watchedValues.photoUrl}
							alt="Avatar"
							className="h-full w-full object-cover"
						/>
					) : (
						<User />
					)}
				</div>
				<div className="space-y-1.5">
					<div className="flex items-center gap-3">
						<h1 className="text-xl font-bold">
							{watchedValues?.firstName || ''} {watchedValues?.lastName || ''}
						</h1>
						{profileData?.user?.role && <Badge>{profileData.user.role}</Badge>}
					</div>
					<p className="flex gap-1.5">
						<MapPin />
						{watchedValues?.location || t('profile.noLocation')}
					</p>
				</div>
			</div>
			<div className="space-y-4">
				<h1 className="text-l font-bold">{t('profile.meSection')}</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Input
						{...register('firstName')}
						disabled={isReadOnly}
						placeholder={t('profile.firstNameLabel')}
					/>
					<Input
						{...register('lastName')}
						disabled={isReadOnly}
						placeholder={t('profile.lastNameLabel')}
					/>
				</div>
				<Input
					{...register('location')}
					disabled={isReadOnly}
					placeholder={t('profile.locationLabel')}
				/>
			</div>

			<div className="space-y-4 pt-5">
				<h1 className="text-l font-bold">{t('profile.infoSection')} </h1>

				{!isReadOnly && (
					<div className="flex gap-10">
						<select
							value={selectedLibraryAttr}
							onChange={e => setSelectedLibraryAttr(e.target.value)}
							className="flex-1"
						>
							<option
								value=""
								className="dark:bg-black dark:text-white "
							>
								{t('profile.selectAttributePlaceholder')}
							</option>
							{libraryAttributes.map(attr => (
								<option
									key={attr.id}
									value={attr.id}
									className="dark:bg-black dark:text-white"
								>
									{attr.name}
								</option>
							))}
						</select>
						<Button
							variant="outline"
							disabled={!selectedLibraryAttr}
							onClick={() => {
								addAttrMutation.mutate(selectedLibraryAttr)
								setSelectedLibraryAttr('')
							}}
						>
							<Plus /> {t('profile.btnAdd')}
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
								<span>
									{attr.attributeLibrary?.name || attr.attribute?.name}
								</span>
								<Input
									{...register(`attrs.${attr.id}`)}
									disabled={isReadOnly}
								/>
							</div>
							{!isReadOnly && (
								<Button
									variant="destructive"
									onClick={() => removeAttrMutation.mutate(attr.id)}
								>
									<Trash2 />
								</Button>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4 pt-5">
				<div className="flex justify-between items-center">
					<h1 className="text-l font-bold">
						{t('profile.projectsSection', 'Projects')}
					</h1>
					{!isReadOnly && (
						<Button
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
						>
							<Plus /> {t('profile.btnAdd')}
						</Button>
					)}
				</div>

				<div className="space-y-4">
					{projects.length > 0 &&
						projects.map(proj => (
							<div
								key={proj.id}
								className="p-3 border  rounded-md space-y-3 relative group"
							>
								{!isReadOnly && (
									<div className="absolute top-4 right-4">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost">
													<MoreVertical />
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
								<h3 className="font-semibold ">{proj.name}</h3>
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
								<div className="text-sm e">
									<ReactMarkdown>{proj.description || ''}</ReactMarkdown>
								</div>
								{proj.tags?.length > 0 && (
									<div className="flex gap-1.5">
										{proj.tags.map(tag => (
											<Badge
												key={tag}
												variant="secondary"
											>
												{tag}
											</Badge>
										))}
									</div>
								)}
							</div>
						))}
				</div>
			</div>
			<div className="space-y-4 pt-2">
				<h1 className="text-l font-bold">{t('profile.cvsSection')}</h1>

				{/* TODO: */}
				<div className="space-y-3">
					{cvs.length > 0 &&
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
						))}
				</div>
			</div>
			<ProfileDialog
				editingProject={editingProject}
				setEditingProject={setEditingProject}
				onSave={project => saveProjectMutation.mutate(project)}
				t={t}
			/>
		</div>
	)
}
