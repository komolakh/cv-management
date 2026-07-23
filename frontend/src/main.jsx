import { ClerkProvider } from '@clerk/clerk-react' // Обязательно с дефисом!
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './i18n'
import './index.css'

// Берем ключ из переменных окружения Vite
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
	throw new Error(
		'Missing Publishable Key. Добавьте VITE_CLERK_PUBLISHABLE_KEY в .env файл'
	)
}

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
			<App />
		</ClerkProvider>
	</React.StrictMode>
)
