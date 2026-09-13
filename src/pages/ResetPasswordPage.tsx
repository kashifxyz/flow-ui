import { useForm } from '@tanstack/react-form'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { notifySuccess, notifyError } from '../lib/toast'
import { ApiError } from '../api/error'
import { useResetPassword } from '../hooks/useResetPassword'
import { AuthLinks, AuthShell, PasswordField } from '../auth/AuthUI'
import { preventSubmit } from '../lib/form'
import { validateNewPassword } from '../lib/validation'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = useSearch({ from: '/reset-password' })
  const resetPassword = useResetPassword()

  const form = useForm({
    defaultValues: { password: '' },
    onSubmit: async ({ value }) => {
      try {
        await resetPassword.mutateAsync({ token, password: value.password })
        notifySuccess('Password updated. Sign in with the new password.')
        await navigate({ to: '/login' })
      } catch (err) {
        notifyError(err instanceof ApiError ? err.message : 'Reset failed')
      }
    },
  })

  return (
    <AuthShell title="Choose a new password" lead="Use at least 10 characters. Previous sessions will be signed out.">
      {!token ? <p className="auth-error">This reset link is missing a token.</p> : null}
      <form onSubmit={preventSubmit(() => void form.handleSubmit())}>
        <form.Field name="password" validators={{ onChange: ({ value }) => validateNewPassword(value) }}>
          {(field) => (
            <PasswordField
              id="reset-password"
              label="New password"
              autoComplete="new-password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') : undefined}
            />
          )}
        </form.Field>
        <button className="auth-submit" type="submit" disabled={!token}>
          Update password
        </button>
      </form>
      <AuthLinks left={{ to: '/login', label: 'Back to sign in' }} />
    </AuthShell>
  )
}
