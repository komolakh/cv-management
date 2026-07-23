import { useAuth, useUser } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
	AlertCircle,
	Briefcase,
	Calendar,
	Check,
	ChevronLeft,
	Edit2,
	Lock,
	Mail,
	UserCheck
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CvConstructor() {
	const { positionId } = useParams()
	const navigate = useNavigate()
	const { getToken, isLoaded, isSignedIn } = useAuth()
	const { user: clerkUser } = useUser()
	const { t, i18n } = useTranslation()
	const queryClient = useQueryClient()

	const [editingAttrId, setEditingAttrId] = useState(null)
	const [editValue, setEditValue] = useState('')

	const userRole = clerkUser?.publicMetadata?.role || 'CANDIDATE'
	const isRecruiter = userRole === 'RECRUITER'
	const canEdit = userRole === 'CANDIDATE' || userRole === 'ADMINISTRATOR'

	const { data, isLoading } = useQuery({
		queryKey: ['cvConstructor', positionId],
		queryFn: async () => {
			const token = await getToken()
			const res = await axios.get(`/api/cvs/position/${positionId}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			return res.data
		},
		enabled:
			isLoaded &&
			isSignedIn &&
			Boolean(positionId && positionId !== 'undefined')
	})

	const saveAttrMutation = useMutation({
		mutationFn: async ({ attributeId, value }) => {
			const token = await getToken()
			await axios.put(
				`/api/profile/attributes/${attributeId}`,
				{ value },
				{ headers: { Authorization: `Bearer ${token}` } }
			)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cvConstructor', positionId] })
			setEditingAttrId(null)
		},
		onError: err => console.error(err)
	})

	const formatDate = dateString => {
		if (!dateString) return t('cvConstructor.presentDate')
		try {
			return new Date(dateString).toLocaleDateString(
				i18n.language === 'ru' ? 'ru-RU' : 'en-US',
				{ year: 'numeric', month: 'short' }
			)
		} catch {
			return dateString
		}
	}

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
				<p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
					{t('cvConstructor.loading')}
				</p>
			</div>
		)
	}

	if (!data) {
		return (
			<div className="max-w-md mx-auto mt-12 p-6 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm text-center space-y-3">
				<p className="text-red-500 font-semibold flex items-center justify-center gap-1.5 text-sm">
					<AlertCircle className="h-4 w-4" /> {t('cvConstructor.errorTitle')}
				</p>
				<p className="text-sm text-slate-500 dark:text-slate-400">
					{t('cvConstructor.errorDesc')}
				</p>
				<Button
					variant="outline"
					onClick={() => navigate('/')}
					className="w-full text-sm h-9"
				>
					{t('cvConstructor.backToMain')}
				</Button>
			</div>
		)
	}

	const { cv, attributes, projects, maxProjects, candidateInfo } = data

	return (
		<div className="max-w-4xl mx-auto space-y-6 p-6 text-slate-900 dark:text-slate-100">
			<div className="flex items-center justify-between">
				<Button
					variant="ghost"
					onClick={() => navigate(-1)}
					className="text-sm gap-1 text-slate-600 dark:text-slate-400 h-8 px-2"
				>
					<ChevronLeft className="h-4 w-4" />
					{t('cvConstructor.backToPositions')}
				</Button>

				{isRecruiter && (
					<Badge
						variant="outline"
						className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 font-semibold gap-1"
					>
						<Lock className="h-3 w-3" />
						{t('cvConstructor.readOnlyMode')}
					</Badge>
				)}
			</div>

			<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
				<div className="bg-slate-900 dark:bg-slate-950 text-white p-6">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<div>
							<span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
								<UserCheck className="h-3.5 w-3.5" />
								{t('cvConstructor.candidateResume')}
							</span>
							<h1 className="text-2xl font-bold mt-1">
								{candidateInfo?.firstName || clerkUser?.firstName || ''}{' '}
								{candidateInfo?.lastName || clerkUser?.lastName || ''}
							</h1>
							<p className="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
								<Briefcase className="h-4 w-4 text-indigo-400" />
								{cv?.position?.title || t('cvConstructor.desiredPosition')}
							</p>
						</div>

						<div className="text-left md:text-right space-y-1 text-sm text-slate-300 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800 w-full md:w-auto">
							<p className="flex items-center md:justify-end gap-1.5">
								<Mail className="h-3.5 w-3.5 text-indigo-400" />
								<span className="text-white font-medium">
									{candidateInfo?.email ||
										clerkUser?.primaryEmailAddress?.emailAddress}
								</span>
							</p>
							<p>
								{t('cvConstructor.recruitmentStatus')}:{' '}
								<Badge
									variant="secondary"
									className="bg-indigo-900/60 text-indigo-300 text-xs font-semibold ml-1"
								>
									{cv?.status || 'DRAFT'}
								</Badge>
							</p>
						</div>
					</div>
				</div>

				<div className="p-6 space-y-6">
					<section className="space-y-3">
						<h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b dark:border-slate-800 pb-2">
							{t('cvConstructor.characteristicsTitle')}
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{attributes?.map(attr => {
								const attrId = attr.attributeId || attr.id
								const isEmpty = !attr.value
								const isEditingThis = editingAttrId === attrId
								const attrName =
									attr.AttributeLibrary?.name ||
									attr.attribute?.name ||
									attr.name
								const attrType =
									attr.AttributeLibrary?.type ||
									attr.type ||
									t('cvConstructor.parameter')

								return (
									<div
										key={attrId}
										className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
											isEmpty
												? 'border-red-200 bg-red-50/40 dark:bg-red-950/10 dark:border-red-900/40'
												: 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'
										}`}
									>
										<div className="flex justify-between items-start gap-2">
											<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
												{attrName}
											</span>
											<Badge
												variant="outline"
												className="text-[10px] uppercase font-mono px-1.5 py-0"
											>
												{attrType}
											</Badge>
										</div>

										<div className="mt-2.5 flex items-center justify-between gap-2">
											{isEditingThis ? (
												<div className="flex items-center gap-1.5 w-full">
													<Input
														value={editValue}
														onChange={e => setEditValue(e.target.value)}
														placeholder={t(
															'cvConstructor.enterValuePlaceholder'
														)}
														className="h-8 text-sm"
														autoFocus
													/>
													<Button
														size="sm"
														disabled={saveAttrMutation.isPending}
														className="h-8 w-8 p-0 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
														onClick={() =>
															saveAttrMutation.mutate({
																attributeId: attrId,
																value: editValue
															})
														}
													>
														<Check className="h-4 w-4" />
													</Button>
												</div>
											) : (
												<>
													<span
														className={`text-sm font-semibold ${
															isEmpty
																? 'text-red-600 dark:text-red-400'
																: 'text-slate-900 dark:text-slate-100'
														}`}
													>
														{isEmpty
															? t('cvConstructor.notFilledWarning')
															: attr.value}
													</span>
													{canEdit && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setEditingAttrId(attrId)
																setEditValue(attr.value || '')
															}}
															className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
														>
															<Edit2 className="h-3.5 w-3.5" />
														</Button>
													)}
												</>
											)}
										</div>
									</div>
								)
							})}
						</div>
					</section>

					<section className="space-y-3">
						<div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
								{t('cvConstructor.projectsTitle')}
							</h3>
							<Badge
								variant="secondary"
								className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
							>
								{t('cvConstructor.templateLimit', {
									count: projects?.length || 0,
									max: maxProjects || 3
								})}
							</Badge>
						</div>

						{!projects || projects.length === 0 ? (
							<div className="text-center py-6 border border-dashed rounded-lg text-slate-400 text-sm space-y-1">
								<p>{t('cvConstructor.noProjects')}</p>
								<p className="text-xs text-slate-500">
									{t('cvConstructor.requiredTagsLabel')}:{' '}
									<strong className="text-indigo-600 dark:text-indigo-400">
										{cv?.position?.projectTags?.join(', ') ||
											t('cvConstructor.noTags')}
									</strong>
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{projects.map(proj => (
									<div
										key={proj.id}
										className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 space-y-2"
									>
										<div className="flex justify-between items-start gap-2">
											<h4 className="font-semibold text-sm">
												{proj.title || proj.name}
											</h4>
											<div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
												<Calendar className="h-3.5 w-3.5 text-indigo-500" />
												<span>
													{formatDate(proj.startDate)} —{' '}
													{formatDate(proj.endDate)}
												</span>
											</div>
										</div>

										<div className="text-sm text-slate-600 dark:text-slate-300 prose dark:prose-invert max-w-none">
											<ReactMarkdown>{proj.description || ''}</ReactMarkdown>
										</div>

										<div className="flex flex-wrap gap-1 pt-1">
											{proj.tags?.map(tag => (
												<span
													key={tag}
													className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded"
												>
													{tag}
												</span>
											))}
										</div>
									</div>
								))}
							</div>
						)}
					</section>
				</div>
			</div>
		</div>
	)
}
