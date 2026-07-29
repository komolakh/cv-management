import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'react-router-dom'

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

	const positionAttributes = cvs[0]?.position?.positionTemplateAttributes || []
	const positionTitle = cvs[0]?.position?.title

	return (
		<div className="container mx-auto max-w-6xl p-6">
			<h1 className="text-xl font-bold mb-10">{positionTitle}</h1>
			<div className="space-y-4">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">
								{t('cvsPage.tableColCandidate')}
							</TableHead>
							<TableHead className="font-semibold">
								{t('cvsPage.tableColLocation')}
							</TableHead>
							{positionAttributes.map(pta => (
								<TableHead
									key={pta.attributeId}
									className="font-semibold"
								>
									{pta.attributeLibrary?.name}
								</TableHead>
							))}
							<TableHead className="font-semibold">
								{t('cvsPage.tableColStatus')}
							</TableHead>
							<TableHead className="font-semibold">
								{t('cvsPage.tableColDate')}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{cvs.length > 0 &&
							cvs.map(cv => (
								<TableRow key={cv.id}>
									<TableCell>
										{`${cv.user.firstName} ${cv.user.lastName}`}
									</TableCell>
									<TableCell>{cv.user?.location}</TableCell>

									{positionAttributes.map(pta => {
										const userAttr = cv.user?.profileAttributeValues?.find(
											attr => attr.attributeId === pta.attributeId
										)
										return (
											<TableCell key={pta.attributeId}>
												{userAttr?.value && (
													<Badge variant="secondary">{userAttr.value}</Badge>
												)}
											</TableCell>
										)
									})}

									<TableCell>
										<Badge variant="secondary">{cv.status}</Badge>
									</TableCell>
									<TableCell>
										{new Date(cv.createdAt).toLocaleDateString()}
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

export default PositionCVs
