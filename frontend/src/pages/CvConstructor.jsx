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
		}
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
			<div className="flex justify-center items-center min-h-[50vh]">
				<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		)
	}

	if (!data) {
		return (
			<div className="max-w-md mx-auto mt-12 p-6 border rounded-lg bg-background text-center space-y-3">
				<p className="text-destructive font-medium flex items-center justify-center gap-1.5 text-sm">
					<AlertCircle className="h-4 w-4" /> {t('cvConstructor.errorTitle')}
				</p>
				<Button
					variant="outline"
					onClick={() => navigate('/positions')}
					className="w-full h-8 text-xs"
				>
					{t('cvConstructor.backToPositions')}
				</Button>
			</div>
		)
	}

	const { cv, attributes, projects, maxProjects, candidateInfo } = data

	return (
		<div className="max-w-4xl mx-auto space-y-4 p-4 md:p-6 text-foreground">
			<div className="flex items-center justify-between">
				<Button
					variant="ghost"
					onClick={() => navigate('/positions')}
					className="text-xs h-7 px-2 gap-1 text-muted-foreground hover:text-foreground"
				>
					<ChevronLeft className="h-4 w-4" />
					{t('cvConstructor.backToPositions')}
				</Button>

				{isRecruiter && (
					<Badge
						variant="outline"
						className="text-[10px] text-amber-500 border-amber-500/30 gap-1"
					>
						<Lock className="h-3 w-3" />
						{t('cvConstructor.readOnlyMode')}
					</Badge>
				)}
			</div>

			<div className="border rounded-lg bg-card overflow-hidden shadow-sm">
				<div className="bg-muted/50 p-5 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
					<div>
						<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
							<UserCheck className="h-3 w-3" />
							{t('cvConstructor.candidateResume')}
						</span>
						<h1 className="text-lg font-bold mt-0.5">
							{candidateInfo?.firstName || clerkUser?.firstName || ''}{' '}
							{candidateInfo?.lastName || clerkUser?.lastName || ''}
						</h1>
						<p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
							<Briefcase className="h-3.5 w-3.5" />
							{cv?.position?.title || t('cvConstructor.desiredPosition')}
						</p>
					</div>

					<div className="text-xs text-muted-foreground space-y-1">
						<p className="flex items-center gap-1">
							<Mail className="h-3 w-3" />
							<span className="text-foreground font-medium">
								{candidateInfo?.email ||
									clerkUser?.primaryEmailAddress?.emailAddress}
							</span>
						</p>
						<p>
							{t('cvConstructor.recruitmentStatus')}:{' '}
							<Badge
								variant="secondary"
								className="text-[10px] ml-1"
							>
								{cv?.status || 'DRAFT'}
							</Badge>
						</p>
					</div>
				</div>

				<div className="p-5 space-y-5">
					<section className="space-y-2">
						<h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1.5">
							{t('cvConstructor.characteristicsTitle')}
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
										className={`p-3 rounded-md border text-xs flex flex-col justify-between ${
											isEmpty
												? 'border-destructive/40 bg-destructive/5'
												: 'bg-background'
										}`}
									>
										<div className="flex justify-between items-start gap-2">
											<span className="font-medium text-muted-foreground">
												{attrName}
											</span>
											<Badge
												variant="outline"
												className="text-[9px] uppercase font-mono px-1 py-0"
											>
												{attrType}
											</Badge>
										</div>

										<div className="mt-2 flex items-center justify-between gap-2">
											{isEditingThis ? (
												<div className="flex items-center gap-1 w-full">
													<Input
														value={editValue}
														onChange={e => setEditValue(e.target.value)}
														placeholder={t(
															'cvConstructor.enterValuePlaceholder'
														)}
														className="h-7 text-xs"
														autoFocus
													/>
													<Button
														size="sm"
														disabled={saveAttrMutation.isPending}
														className="h-7 w-7 p-0 shrink-0"
														onClick={() =>
															saveAttrMutation.mutate({
																attributeId: attrId,
																value: editValue
															})
														}
													>
														<Check className="h-3.5 w-3.5" />
													</Button>
												</div>
											) : (
												<>
													<span
														className={`font-semibold ${
															isEmpty ? 'text-destructive' : 'text-foreground'
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
															className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
														>
															<Edit2 className="h-3 w-3" />
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

					<section className="space-y-2">
						<div className="flex justify-between items-center border-b pb-1.5">
							<h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
								{t('cvConstructor.projectsTitle')}
							</h3>
							<Badge
								variant="secondary"
								className="text-[10px]"
							>
								{t('cvConstructor.templateLimit', {
									count: projects?.length || 0,
									max: maxProjects || 3
								})}
							</Badge>
						</div>

						{!projects || projects.length === 0 ? (
							<div className="text-center py-5 border border-dashed rounded-md text-muted-foreground text-xs space-y-1">
								<p>{t('cvConstructor.noProjects')}</p>
								<p className="text-[11px]">
									{t('cvConstructor.requiredTagsLabel')}:{' '}
									<strong className="text-foreground">
										{cv?.position?.projectTags?.join(', ') ||
											t('cvConstructor.noTags')}
									</strong>
								</p>
							</div>
						) : (
							<div className="space-y-2.5">
								{projects.map(proj => (
									<div
										key={proj.id}
										className="p-3.5 border rounded-md bg-background space-y-1.5 text-xs"
									>
										<div className="flex justify-between items-start gap-2">
											<h4 className="font-semibold">
												{proj.title || proj.name}
											</h4>
											<div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
												<Calendar className="h-3 w-3" />
												<span>
													{formatDate(proj.startDate)} —{' '}
													{formatDate(proj.endDate)}
												</span>
											</div>
										</div>

										<div className="text-muted-foreground prose dark:prose-invert max-w-none text-xs">
											<ReactMarkdown>{proj.description || ''}</ReactMarkdown>
										</div>

										<div className="flex flex-wrap gap-1 pt-1">
											{proj.tags?.map(tag => (
												<span
													key={tag}
													className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
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
