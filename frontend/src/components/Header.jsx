import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton
} from '@clerk/clerk-react'
import {
	Database,
	Globe,
	LayoutDashboard,
	Menu,
	Moon,
	Shield,
	Sun,
	User
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from './ui/sheet'

export function LanguageSwitcher() {
	const { i18n } = useTranslation()
	const toggleLang = () =>
		i18n.changeLanguage(i18n.language?.startsWith('ru') ? 'en' : 'ru')

	return (
		<button
			onClick={toggleLang}
			className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-slate-700 dark:text-slate-300"
		>
			<Globe className="h-3.5 w-3.5 text-slate-500" />
			<span>{i18n.language?.startsWith('ru') ? 'EN' : 'RU'}</span>
		</button>
	)
}

export function ThemeToggle() {
	const [isDark, setIsDark] = useState(() => {
		return (
			document.documentElement.classList.contains('dark') ||
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) &&
				window.matchMedia('(prefers-color-scheme: dark)').matches)
		)
	})

	useEffect(() => {
		if (isDark) {
			document.documentElement.classList.add('dark')
			localStorage.setItem('theme', 'dark')
		} else {
			document.documentElement.classList.remove('dark')
			localStorage.setItem('theme', 'light')
		}
	}, [isDark])

	return (
		<button
			onClick={() => setIsDark(!isDark)}
			className="flex items-center justify-center p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-slate-700 dark:text-slate-300"
			title="Toggle theme"
		>
			{isDark ? (
				<Sun className="h-3.5 w-3.5 text-amber-400" />
			) : (
				<Moon className="h-3.5 w-3.5 text-slate-600" />
			)}
		</button>
	)
}

export function NavLinks({ isStaff, isAdmin, onClick = () => {} }) {
	const { t } = useTranslation()

	return (
		<>
			<Link
				to="/positions"
				onClick={onClick}
				className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
			>
				<LayoutDashboard className="h-4 w-4 text-slate-400" />
				{t('header.positions')}
			</Link>

			<SignedIn>
				<Link
					to="/profile"
					onClick={onClick}
					className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
				>
					<User className="h-4 w-4 text-slate-400" />
					{t('header.profile')}
				</Link>
				{isStaff && (
					<Link
						to="/attribute"
						onClick={onClick}
						className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
					>
						<Database className="h-4 w-4 text-slate-400" />
						{t('header.attributeLibrary')}
					</Link>
				)}
				{isAdmin && (
					<Link
						to="/admin"
						onClick={onClick}
						className="px-3 py-2 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center gap-1.5 font-bold"
					>
						<Shield className="h-4 w-4 text-amber-500" />
						{t('header.admin')}
					</Link>
				)}
			</SignedIn>
		</>
	)
}

export function Header({ isStaff, isAdmin }) {
	const { t } = useTranslation()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
				<div className="flex items-center space-x-4 sm:space-x-8">
					<div className="md:hidden">
						<Sheet
							open={mobileMenuOpen}
							onOpenChange={setMobileMenuOpen}
						>
							<SheetTrigger asChild>
								<button
									className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
									aria-label="Open menu"
								>
									<Menu className="h-5 w-5" />
								</button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="w-[280px] sm:w-[320px]"
							>
								<SheetHeader>
									<SheetTitle className="text-left font-black tracking-tight text-slate-900 dark:text-white">
										{t('header.logo')}
									</SheetTitle>
								</SheetHeader>
								<nav className="flex flex-col space-y-2 mt-6 text-sm font-semibold">
									<NavLinks
										isStaff={isStaff}
										isAdmin={isAdmin}
										onClick={() => setMobileMenuOpen(false)}
									/>
								</nav>
							</SheetContent>
						</Sheet>
					</div>

					<Link
						to="/"
						className="font-black text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2"
					>
						<span>{t('header.logo')}</span>
					</Link>

					<nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
						<NavLinks
							isStaff={isStaff}
							isAdmin={isAdmin}
						/>
					</nav>
				</div>

				<div className="flex items-center space-x-3">
					<ThemeToggle />
					<LanguageSwitcher />
					<SignedOut>
						<div className="space-x-2 flex items-center">
							<SignInButton mode="modal">
								<button className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
									{t('header.signIn')}
								</button>
							</SignInButton>
							<SignUpButton mode="modal">
								<button className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm cursor-pointer">
									{t('header.signUp')}
								</button>
							</SignUpButton>
						</div>
					</SignedOut>
					<SignedIn>
						<UserButton
							userProfileMode="navigation"
							userProfileUrl="/profile"
						/>
					</SignedIn>
				</div>
			</div>
		</header>
	)
}
