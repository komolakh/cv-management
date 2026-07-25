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

import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

function LanguageSwitcher() {
	const { i18n } = useTranslation()
	const toggleLang = () =>
		i18n.changeLanguage(i18n.language?.startsWith('ru') ? 'en' : 'ru')

	return (
		<Button
			onClick={toggleLang}
			variant="outline"
		>
			<Globe />
			<span>{i18n.language?.startsWith('ru') ? 'EN' : 'RU'}</span>
		</Button>
	)
}

function ThemeToggle() {
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
		<Button
			onClick={() => setIsDark(!isDark)}
			variant="outline"
			title="Toggle theme"
		>
			{isDark ? <Sun /> : <Moon />}
		</Button>
	)
}

function NavLinks({ isRecruiter, isAdmin, onClick = () => {} }) {
	const { t } = useTranslation()

	return (
		<>
			<Link
				to="/positions"
				onClick={onClick}
				className="px-3 py-2 flex items-center gap-1.5"
			>
				<LayoutDashboard className="h-4 w-4 text-slate-400" />
				{t('header.positions')}
			</Link>

			<SignedIn>
				<Link
					to="/profile"
					onClick={onClick}
					className="px-3 py-2 flex items-center gap-1.5"
				>
					<User className="h-4 w-4 text-slate-400" />
					{t('header.profile')}
				</Link>
				{isRecruiter && (
					<Link
						to="/attribute-library"
						onClick={onClick}
						className="px-3 py-2 flex items-center gap-1.5"
					>
						<Database className="h-4 w-4 text-slate-400" />
						{t('header.attributeLibrary')}
					</Link>
				)}
				{isAdmin && (
					<Link
						to="/admin"
						onClick={onClick}
						className="px-3 py-2 flex items-center gap-1.5"
					>
						<Shield className="h-4 w-4 text-slate-400" />
						{t('header.admin')}
					</Link>
				)}
			</SignedIn>
		</>
	)
}

export function Header({ isRecruiter, isAdmin }) {
	const { t } = useTranslation()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<header>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<div className="md:hidden">
						<Sheet
							open={mobileMenuOpen}
							onOpenChange={setMobileMenuOpen}
						>
							<SheetTrigger asChild>
								<button aria-label="Open menu">
									<Menu />
								</button>
							</SheetTrigger>
							<SheetContent side="left">
								<nav className="flex flex-col space-y-2 mt-15 font-semibold">
									<NavLinks
										isRecruiter={isRecruiter}
										isAdmin={isAdmin}
										onClick={() => setMobileMenuOpen(false)}
									/>
								</nav>
							</SheetContent>
						</Sheet>
					</div>

					<Link
						to="/"
						className="font-black text-lg"
					>
						<span>{t('header.logo')}</span>
					</Link>

					<nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
						<NavLinks
							isRecruiter={isRecruiter}
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
								<Button variant="outline">{t('header.signIn')}</Button>
							</SignInButton>
							<SignUpButton mode="modal">
								<Button>{t('header.signUp')}</Button>
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
