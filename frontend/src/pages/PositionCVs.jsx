import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'

import Loader from '@/components/Loader'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { useTranslation } from 'react-i18next'

const PositionCVs = () => {
	const { positionId } = useParams()
	const { t } = useTranslation()
	const navigate = useNavigate()

	const { data: cvs = [], isLoading } = useQuery({
		queryKey: ['position-cvs', positionId],
		queryFn: async () => {
			const res = await axios.get(`/api/cvs/${positionId}`)
			return res.data
		},
		enabled: !!positionId
	})

	if (isLoading) {
		return <Loader />
	}

	return (
		<div className="space-y-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="font-semibold">
							{t('cvsPage.tableColCandidate', 'Candidate')}
						</TableHead>
						<TableHead className="font-semibold">
							{t('cvsPage.tableColLocation', 'Location')}
						</TableHead>
						<TableHead className="font-semibold">
							{t('cvsPage.tableColAttributes', 'Attributes')}
						</TableHead>
						<TableHead className="font-semibold">
							{t('cvsPage.tableColStatus', 'Status')}
						</TableHead>
						<TableHead className="font-semibold">
							{t('cvsPage.tableColDate', 'Created At')}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{cvs.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={5}
								className="text-center text-muted-foreground py-6"
							>
								{t('cvsPage.noCvs', 'No CVs found for this position')}
							</TableCell>
						</TableRow>
					) : (
						cvs.map(cv => (
							<TableRow
								key={cv.id}
								onClick={() => navigate(`/cv/${cv.positionId}/${cv.userId}`)}
								className="cursor-pointer"
							>
								<TableCell className="font-medium flex items-center gap-2">
									{cv.user?.photoUrl && (
										<img
											src={cv.user.photoUrl}
											alt=""
											className="w-8 h-8 rounded-full object-cover"
										/>
									)}
									<span>
										{cv.user?.firstName || cv.user?.lastName
											? `${cv.user.firstName} ${cv.user.lastName}`
											: cv.user?.email || 'Unnamed'}
									</span>
								</TableCell>
								<TableCell>{cv.user?.location || '—'}</TableCell>
								<TableCell>
									<div className="flex flex-wrap gap-1">
										{cv.user?.profileAttributeValues?.length > 0 ? (
											cv.user.profileAttributeValues.map(attr => (
												<Badge
													key={attr.id}
													variant="secondary"
												>
													{attr.attributeLibrary?.name}: {attr.value}
												</Badge>
											))
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant={
											cv.status === 'PUBLISHED' ? 'default' : 'secondary'
										}
									>
										{cv.status}
									</Badge>
								</TableCell>
								<TableCell>
									{new Date(cv.createdAt).toLocaleDateString()}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	)
}

export default PositionCVs
