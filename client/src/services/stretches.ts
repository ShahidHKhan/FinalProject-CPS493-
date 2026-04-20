import { api } from './myFetch'
import type { Stretch } from '../stores/types'

type DataListEnvelope<T> = {
	data: T[]
	isSuccess: boolean
	total: number
	message?: string
}

export function getStretches() {
	return api<DataListEnvelope<Stretch>>('/stretches')
}
