import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Calendar, Check, Edit2, Mail } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'

import Loader from '@/components/Loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserRole } from '@/hooks/useUserRole'

export default function CvConstructor() {
	const { positionId } = useParams()
	const { getToken, isLoaded, isSignedIn } = useAuth()
	const { t, i18n } = useTranslation()
	const queryClient = useQueryClient()

	const [editingAttrId, setEditingAttrId] = useState(null)
	const [editValue, setEditValue] = useState('')

	const { isCandidate, dbUser } = useUserRole()

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
		return <Loader />
	}

	const {
		cv = {},
		attributes = [],
		projects = [],
		maxProjects = 3
	} = data || {}

	return (
		<div className="container mx-auto max-w-6xl p-6">
			<h1 className="text-2xl font-bold mb-5">{cv?.position?.title}</h1>

			<div className="space-y-3">
				<p className="flex items-center gap-1">
					<Mail />
					<span>{dbUser?.email}</span>
				</p>
				<p>
					{t('cvConstructor.recruitmentStatus')}: <Badge>{cv?.status}</Badge>
				</p>
			</div>

			<div className="space-y-5 mt-5">
				<section className="space-y-2">
					<h3 className="font-semibold">
						{t('cvConstructor.characteristicsTitle')}
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
						{attributes?.map(attr => {
							const attrId = attr.id
							const isEmpty = !attr.value
							const isEditingThis = editingAttrId === attrId
							const attrName = attr.AttributeLibrary?.name
							const attrType = attr.AttributeLibrary?.type

							return (
								<div
									key={attrId}
									className={`p-3 rounded-md border ${
										isEmpty ? 'border-destructive' : 'bg-background'
									}`}
								>
									<div className="flex justify-between">
										<span className="font-semibold">{attrName}</span>
										<Badge variant="outline">{attrType}</Badge>
									</div>

									<div className="mt-2 flex justify-between ">
										{isEditingThis ? (
											<div className="flex gap-5 w-full">
												<Input
													value={editValue}
													onChange={e => setEditValue(e.target.value)}
													placeholder={t('cvConstructor.enterValuePlaceholder')}
													autoFocus
												/>
												<Button
													disabled={saveAttrMutation.isPending}
													onClick={() =>
														saveAttrMutation.mutate({
															attributeId: attrId,
															value: editValue
														})
													}
												>
													<Check />
												</Button>
											</div>
										) : (
											<>
												<span className={`${isEmpty && 'text-destructive'}`}>
													{isEmpty
														? t('cvConstructor.notFilledWarning')
														: attr.value}
												</span>
												{isCandidate && (
													<Button
														variant="ghost"
														onClick={() => {
															setEditingAttrId(attrId)
															setEditValue(attr.value || '')
														}}
													>
														<Edit2 />
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
					<div className="flex justify-between">
						<h3 className="font-semibold ">
							{t('cvConstructor.projectsTitle')}
						</h3>
						<Badge variant="outline">
							{t('cvConstructor.templateLimit', {
								count: projects?.length || 0,
								max: maxProjects
							})}
						</Badge>
					</div>

					{projects.length > 0 && (
						<div className="space-y-2">
							{projects.map(proj => (
								<div
									key={proj.id}
									className="p-3.5 border rounded-md  space-y-2"
								>
									<div className="flex justify-between ">
										<h3 className="font-semibold">{proj.name}</h3>
										<div className="flex items-center gap-1 text-xs ">
											<Calendar className="h-3 w-3" />
											<span>
												{formatDate(proj.startDate)} —{' '}
												{formatDate(proj.endDate)}
											</span>
										</div>
									</div>

									<ReactMarkdown>{proj.description}</ReactMarkdown>

									<div className="flex flex-wrap gap-2 pt-1">
										{proj.tags?.map(tag => (
											<Badge
												key={tag}
												variant="secondary"
											>
												{tag}
											</Badge>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	)
}
