import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from './types'
import * as myFetch from '../services/myFetch'

export const useSessionStore = defineStore('session', function () {
	const user = ref<User | null>(null)
	const messages = ref<string[]>([])

	const loadingCount = ref(0)
	const isLoading = computed(function () {
		return loadingCount.value > 0
	})

	function addMessage(message: string) {
		messages.value.push(message)
	}

	function clearMessages() {
		messages.value = []
	}

	function api<T>(endpoint: string, data?: unknown, options: RequestInit = {}) {
		loadingCount.value++

		return myFetch.api<T>(endpoint, data, options).finally(function () {
			loadingCount.value--
		})
	}

	return {
		user,
		messages,
		isLoading,
		addMessage,
		clearMessages,
		api,
	}
})
