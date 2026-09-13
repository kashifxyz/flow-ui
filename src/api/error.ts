export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type ErrorBody = {
  error?: { code?: string; message?: string }
}

/**
 * Unwraps an openapi-fetch result into its data, or throws an ApiError.
 * openapi-fetch returns `{ data, error }` instead of throwing — the rest of
 * the app (forms, mutations) is written against a throw-on-failure client,
 * so this is the one place that boundary is crossed.
 */
export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error !== undefined) {
    const body = result.error as ErrorBody
    throw new ApiError(
      result.response.status,
      body?.error?.code ?? 'error',
      body?.error?.message ?? result.response.statusText,
    )
  }
  return result.data as T
}
