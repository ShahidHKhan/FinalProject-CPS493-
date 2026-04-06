const API_BASE_URL = 'http://localhost:3000/api/v1'

export default function rest<T>(url: string): Promise<T> {
  return fetch(url).then((response) => {
    if (!response.ok) {
      return response.text().then((text) => {
        throw new Error(text)
      })
    }

    return response.json() as Promise<T>
  })
}

export function api<T>(endpoint: string) {
  return rest<T>(`${API_BASE_URL}${endpoint}`)
}
