const API_BASE_URL = import.meta.env.VITE_API_ROOT

export default function rest<T>(
  url: string,
  data?: unknown,
  options: RequestInit = {},
): Promise<T> {
  options = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  return fetch(url, options).then((res) => {
    if (!res.ok) {
      if (res.headers.get('Content-Type')?.includes('application/json')) {
        return res.json().then((errorData: { message?: string }) => {
          throw new Error(errorData.message || 'An error occurred')
        })
      }

      return res.text().then((text) => {
        throw new Error(text)
      })
    }

    return res.json() as Promise<T>
  })
}

export function api<T>(
  endpoint: string,
  data?: unknown,
  options: RequestInit = {},
) {
  const base = API_BASE_URL.replace(/\/+$/, '')
  const path = endpoint.replace(/^\/+/, '')
  return rest<T>(`${base}/${path}`, data, options)
}

export function loadScript(src: string, id?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src

    if (id) {
      script.id = id
    }

    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.body.appendChild(script)
  })
}
