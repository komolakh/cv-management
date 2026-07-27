import { Loader2 } from 'lucide-react'

const Loader = () => {
	return (
		<div className="flex h-48 items-center justify-center">
			<Loader2 className=" animate-spin " />
		</div>
	)
}

export default Loader
