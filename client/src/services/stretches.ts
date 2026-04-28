import { api } from './myFetch'
import type { Stretch } from '../stores/types'

type DataListEnvelope<T> = {
	data: T[]
	isSuccess: boolean
	total: number
	message?: string
}

type GetStretchesOptions = {
	page?: number
	pageSize?: number
	search?: string
}

export function getStretches(options: GetStretchesOptions = {}) {
	const params = new URLSearchParams()

	if (options.page !== undefined) {
		params.set('page', String(options.page))
	}

	if (options.pageSize !== undefined) {
		params.set('pageSize', String(options.pageSize))
	}

	if (options.search !== undefined && options.search.trim()) {
		params.set('search', options.search.trim())
	}

	const query = params.toString()
	const endpoint = query ? `/stretches?${query}` : '/stretches'

	return api<DataListEnvelope<Stretch>>(endpoint)
}
