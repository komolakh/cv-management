import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

export default function Home() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [searchQuery, setSearchQuery] = useState('')

	const { data = {}, isLoading } = useQuery({
		queryKey: ['homeMainData'],
		queryFn: async () => {
			const [statsRes, latestRes, popularRes, tagsRes] = await Promise.all([
				axios.get('/api/positions/public-stats').catch(() => ({ data: {} })),
				axios.get('/api/positions').catch(() => ({ data: [] })),
				axios.get('/api/positions/popular').catch(() => ({ data: [] })),
				axios.get('/api/positions/tags').catch(() => ({ data: [] }))
			])
			return {
				stats: statsRes.data,
				latestPositions: Array.isArray(latestRes.data) ? latestRes.data : [],
				popularPositions: Array.isArray(popularRes.data) ? popularRes.data : [],
				tags: Array.isArray(tagsRes.data) ? tagsRes.data : []
			}
		}
	})

	const { stats, latestPositions = [], popularPositions = [], tags = [] } = data
	const filteredPositions = latestPositions.filter(pos =>
		pos?.title?.toLowerCase().includes(searchQuery.toLowerCase())
	)

	if (isLoading) {
		return (
			<div className="flex h-48 items-center justify-center">
				<Loader2 className=" animate-spin " />
			</div>
		)
	}

	return (
		<div className="container mx-auto max-w-6xl p-6">
			<div className="space-y-3 mb-10">
				<div className="flex items-center justify-between gap-3">
					<h2 className="font-semibold ">{t('home.latestPositions')}</h2>
					<Input
						type="text"
						placeholder={t('home.searchPlaceholder')}
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className="flex-1"
					/>
				</div>

				<Table className="border rounded-md">
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">
								{t('home.tableColTitle')}
							</TableHead>
							<TableHead className="font-semibold">
								{t('home.tableColDesc')}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredPositions.length > 0 &&
							filteredPositions.map(pos => (
								<TableRow
									key={pos.id}
									onClick={() => navigate(`/cv/${pos.id}`)}
								>
									<TableCell>{pos.title}</TableCell>
									<TableCell>
										{pos.shortDescription || pos.description}
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</div>

			<div className="space-y-3 mb-10">
				<h2 className="font-semibold">{t('home.popularPositionsTitle')}</h2>

				<Table className="border rounded-md">
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">
								{t('home.tableColPopularNum')}
							</TableHead>
							<TableHead className="font-semibold">
								{t('home.tableColPopularTitle')}
							</TableHead>
							<TableHead className="font-semibold">
								{t('home.tableColPopularCount')}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{popularPositions.slice(0, 5).map((pos, index) => (
							<TableRow
								key={pos.id}
								onClick={() => navigate(`/cv/${pos.id}`)}
							>
								<TableCell>{index + 1}</TableCell>
								<TableCell>{pos.title}</TableCell>
								<TableCell>{pos.submittedCvsCount}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="space-y-3 mb-10">
				<h3 className="font-semibold">{t('home.techCloudTitle')}</h3>

				<div className="flex flex-wrap gap-2">
					{tags.map(tag => (
						<Badge
							key={tag.id || tag.name}
							variant="secondary"
						>
							{tag.name}
						</Badge>
					))}
				</div>
			</div>

			<div className="space-y-3">
				<h2 className="font-semibold">{t('home.statsTitle')}</h2>
				<div className="grid grid-cols-5 gap-3">
					{[
						{
							label: t('home.newCvs24h'),
							value: stats?.newCvsLast24h,
							highlight: true
						},
						{ label: t('home.totalPositions'), value: stats?.totalPositions },
						{ label: t('home.candidates'), value: stats?.totalCandidates },
						{ label: t('home.recruiters'), value: stats?.totalRecruiters },
						{
							label: t('home.totalSubmittedCvs'),
							value: stats?.totalSubmittedCvs
						}
					].map((stat, i) => (
						<div
							key={i}
							className={`p-4 rounded-md border`}
						>
							<p className="text-xs">{stat.label}</p>
							<p className="text-xl font-bold mt-1">{stat.value || 0}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
