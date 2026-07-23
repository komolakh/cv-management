import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'

export default function Home() {
	const { t } = useTranslation()
	const [searchQuery, setSearchQuery] = useState('')

	const { data = {}, isLoading } = useQuery({
		queryKey: ['homeMainData'],
		queryFn: async () => {
			const [statsRes, latestRes, popularRes, tagsRes] = await Promise.all([
				axios.get('/api/public-stats').catch(() => ({ data: {} })),
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
			<div className="flex items-center justify-center min-h-[50vh] text-sm text-slate-400">
				{t('home.loading')}
			</div>
		)
	}

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-8 text-slate-900 dark:text-slate-100">
			<div className="space-y-3">
				<h2 className="text-base font-semibold">{t('home.statsTitle')}</h2>
				<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
					{[
						{ label: t('home.totalPositions'), value: stats?.totalPositions },
						{ label: t('home.candidates'), value: stats?.totalCandidates },
						{ label: t('home.recruiters'), value: stats?.totalRecruiters },
						{
							label: t('home.totalSubmittedCvs'),
							value: stats?.totalSubmittedCvs
						},
						{
							label: t('home.newCvs24h'),
							value: stats?.newCvsLast24h,
							highlight: true
						}
					].map((stat, i) => (
						<div
							key={i}
							className={`p-4 rounded-lg border shadow-sm ${
								stat.highlight
									? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400'
									: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
							}`}
						>
							<p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
								{stat.label}
							</p>
							<p className="text-xl font-bold mt-1">{stat.value || 0}</p>
						</div>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<div className="space-y-3">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
							<h2 className="text-base font-semibold">
								{t('home.latestPositions')}
							</h2>
							<input
								type="text"
								placeholder={t('home.searchPlaceholder')}
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg w-full sm:w-60 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
							/>
						</div>

						<div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
							<Table>
								<TableHeader className="bg-slate-50 dark:bg-slate-950">
									<TableRow>
										<TableHead className="text-sm">
											{t('home.tableColTitle')}
										</TableHead>
										<TableHead className="text-sm">
											{t('home.tableColDesc')}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredPositions.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={2}
												className="text-center py-8 text-sm text-slate-400"
											>
												{t('home.noPositionsFound')}
											</TableCell>
										</TableRow>
									) : (
										filteredPositions.map(pos => (
											<TableRow
												key={pos.id}
												onClick={() =>
													alert(t('actions.buildCvAlert', { title: pos.title }))
												}
												className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
											>
												<TableCell className="font-semibold text-sm">
													{pos.title}
												</TableCell>
												<TableCell className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
													{pos.shortDescription || pos.description}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</div>

					<div className="space-y-3">
						<h2 className="text-base font-semibold">
							{t('home.popularPositionsTitle')}
						</h2>
						<div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
							<Table>
								<TableHeader className="bg-slate-50 dark:bg-slate-950">
									<TableRow>
										<TableHead className="w-12 text-center text-sm">
											{t('home.tableColPopularNum')}
										</TableHead>
										<TableHead className="text-sm">
											{t('home.tableColPopularTitle')}
										</TableHead>
										<TableHead className="text-sm text-right">
											{t('home.tableColPopularCount')}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{popularPositions.slice(0, 5).map((pos, index) => (
										<TableRow
											key={pos.id}
											onClick={() =>
												alert(t('actions.buildCvAlert', { title: pos.title }))
											}
											className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
										>
											<TableCell className="text-center font-bold text-slate-400 text-sm">
												{index + 1}
											</TableCell>
											<TableCell className="font-medium text-sm">
												{pos.title}
											</TableCell>
											<TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
												{pos.submittedCvsCount || 0}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm space-y-3">
						<h3 className="text-base font-semibold">
							{t('home.techCloudTitle')}
						</h3>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							{t('home.techCloudDesc')}
						</p>

						<div className="flex flex-wrap gap-1.5">
							{tags.map(tag => (
								<button
									key={tag.id || tag.name}
									onClick={() =>
										alert(t('actions.techFilterAlert', { tech: tag.name }))
									}
									className="px-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-indigo-500 transition-colors cursor-pointer"
								>
									#{tag.name}
									{tag.count !== undefined && (
										<span className="ml-1 opacity-60">({tag.count})</span>
									)}
								</button>
							))}
							{tags.length === 0 && (
								<p className="text-sm text-slate-400 italic">
									{t('home.noTagsFound')}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
