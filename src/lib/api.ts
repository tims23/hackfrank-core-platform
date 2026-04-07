import { firebaseAuth } from "./firebase"

/**
 * Get the Firebase ID token for the current user
 * Use this to authenticate API requests
 */
export async function getAuthToken(): Promise<string | null> {
  const user = firebaseAuth.currentUser
  if (!user) {
    return null
  }

  // Force refresh to avoid stale tokens when auth state has just changed.
  return user.getIdToken(true)
}

const buildRequestUrl = (endpoint: string): string => {
  if (endpoint.startsWith("http")) {
    return endpoint
  }

  const apiProxyTarget = (import.meta.env.VITE_API_PROXY_TARGET as string | undefined)?.trim()
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  const selectedBaseUrl = apiProxyTarget || apiBaseUrl

  if (!selectedBaseUrl) {
    return endpoint
  }

  const normalizedBase = selectedBaseUrl.replace(/\/$/, "")
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`

  // If the base URL already includes /api and endpoint starts with /api, avoid /api/api.
  if (normalizedBase.endsWith("/api") && normalizedEndpoint.startsWith("/api/")) {
    return `${normalizedBase}${normalizedEndpoint.slice(4)}`
  }

  return `${normalizedBase}${normalizedEndpoint}`
}

/**
 * Make an authenticated API request
 */
export async function apiCall<T>(
  endpoint: string,
  action: string,
  data: Record<string, unknown>,
): Promise<T> {
  const token = await getAuthToken()
  if (!token) {
    throw new Error("User not authenticated")
  }

  const requestUrl = buildRequestUrl(endpoint)

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action,
      ...data,
    }),
  })

  const responseText = await response.text()
  const responseContentType = response.headers.get("content-type") ?? ""
  const isJsonResponse = responseContentType.includes("application/json")
  const parsedResponse = isJsonResponse && responseText
    ? (JSON.parse(responseText) as { error?: string })
    : null

  if (!response.ok) {
    const fallbackMessage = responseText
      ? responseText.slice(0, 200)
      : `${response.status} ${response.statusText}`
    throw new Error(parsedResponse?.error || fallbackMessage || "API request failed")
  }

  if (!responseText) {
    throw new Error(`Empty response body from ${requestUrl}`)
  }

  if (!isJsonResponse) {
    throw new Error(`Expected JSON response from ${requestUrl} but received ${responseContentType || "unknown content-type"}`)
  }

  return JSON.parse(responseText) as T
}
