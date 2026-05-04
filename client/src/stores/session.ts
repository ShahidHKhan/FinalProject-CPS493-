/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import type { DataEnvelope } from '../../../server/types'
import { computed, ref } from 'vue'

import { useAuthStore } from './auth'
import { api as myApi, loadScript } from '../services/myFetch'

type SessionUser = {
	firstName: string
	lastName: string
	email: string
	image: string
	name: string
	role?: string
}

type GoogleTokenResponse = {
	access_token?: string
	error?: string
}

type GoogleUserInfo = {
	given_name?: string
	family_name?: string
	email?: string
	picture?: string
}

type GoogleAccountsOauth2 = {
	initTokenClient: (config: {
		client_id: string
		scope: string
		callback: (response: GoogleTokenResponse) => void | Promise<void>
	}) => {
		requestAccessToken: () => void
	}
}

type GoogleApi = {
	accounts?: {
		oauth2?: GoogleAccountsOauth2
	}
}

export type FeedbackMessage = {
	type: 'success' | 'danger' | 'info'
	text: string
}

export const useSessionStore = defineStore('session', () => {
	const user = ref<SessionUser | null>(null)
	const token = ref<string | null>(null)
	const authStore = useAuthStore()
	const googleScriptPromise = loadScript('https://accounts.google.com/gsi/client', 'google-signin')

	async function login() {
		await googleScriptPromise

		const google = (window as Window & { google?: GoogleApi }).google
		const tokenClient = google?.accounts?.oauth2?.initTokenClient
		const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

		if (!tokenClient) {
			throw new Error('Google OAuth client is unavailable.')
		}

		if (!clientId) {
			throw new Error('Google login is not configured for this deployment. Set VITE_GOOGLE_CLIENT_ID and rebuild the client.')
		}

		const client = tokenClient({
			client_id: clientId,
			scope: 'email profile https://www.googleapis.com/auth/calendar.events.readonly',
			callback: async (response) => {
				if (response.error) {
					throw new Error(response.error)
				}

				if (!response.access_token) {
					throw new Error('Google did not return an access token.')
				}

				await setUser(response.access_token)
				await syncCurrentProfile()
				await getCalendarEvents(response.access_token)
			},
		})

		client.requestAccessToken()
	}

	async function setUser(accessToken: string) {
		const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})

		if (!response.ok) {
			throw new Error('Unable to load Google profile information.')
		}

		const data: GoogleUserInfo = await response.json()
		const firstName = data.given_name ?? ''
		const lastName = data.family_name ?? ''
		const name = `${firstName} ${lastName}`.trim()

		user.value = {
			firstName,
			lastName,
			email: data.email ?? '',
			image: data.picture ?? '',
			name: name || data.email || 'Signed in user',
		}
	}

	async function getCalendarEvents(googleToken: string) {
		const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
			headers: {
				Authorization: `Bearer ${googleToken}`,
			},
		})

		if (!response.ok) {
			return
		}

		const data = await response.json()
		console.log({ calendarEvents: data })
	}

	async function exchangeForOurToken(googleToken: string) {
		const response = await myApi<DataEnvelope<{ user: SessionUser; token: string }>>(
			'users/login',
			{ googleToken },
			{ method: 'POST' },
		)

		if (!response.isSuccess) {
			throw new Error(response.message || 'Login failed')
		}

		const { user: loggedInUser, token: authToken } = response.data
		user.value = loggedInUser
		token.value = authToken
	}

	async function syncCurrentProfile() {
		await authStore.loadAccounts()

		const googleEmail = user.value?.email?.trim().toLowerCase()
		if (!googleEmail) {
			authStore.logout()
			return
		}

		const matchingAccount = authStore.availableAccounts.find(function (account) {
			return account.email?.trim().toLowerCase() === googleEmail
		})

		if (!matchingAccount) {
			authStore.logout()
			return
		}

		authStore.loginAs(matchingAccount)
	}

	function logout() {
		user.value = null
		token.value = null
		authStore.logout()
	}

	const messages = ref<FeedbackMessage[]>([])
	function addMessage(text: string, type: FeedbackMessage['type'] = 'info') {
		messages.value.push({ type, text })
	}
	function handleError(error: Error | string) {
		const message = typeof error === 'string' ? error : error.message
		addMessage(message, 'danger')
		console.error(error)
	}

	const loadingCount = ref(0)
	const isLoading = computed(() => loadingCount.value > 0)

	function api<T>(endpoint: string, data?: unknown, options: RequestInit = {}) {
		loadingCount.value++

		options.headers = {
			...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
			...options.headers,
		}

		return myApi<T>(endpoint, data, options)
			.catch((error) => {
				handleError(error)
				throw error
			})
			.finally(() => {
				loadingCount.value--
			})
	}

	return {
		user,
		token,
		login,
		logout,
		messages,
		addMessage,
		handleError,
		isLoading,
		api,
		setUser,
		getCalendarEvents,
		exchangeForOurToken,
	}
})
