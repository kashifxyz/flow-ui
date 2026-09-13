import { useForm } from '@tanstack/react-form'
import { notifySuccess, notifyError } from '../lib/toast'
import { ApiError } from '../api/error'
import { useForgotPassword } from '../hooks/useForgotPassword'
import { AuthLinks, AuthShell } from '../auth/AuthUI'
import { preventSubmit } from '../lib/form'
import { validateEmail } from '../lib/validation'

export function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword()

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      try {
        await forgotPassword.mutateAsync(value.email)
        notifySuccess('If that account exists, a reset email is on the way')
      } catch (err) {
        notifyError(err instanceof ApiError ? err.message : 'Request failed')
      }
    },
  })

  return (
    <AuthShell title="Reset password" lead="We will email a reset link if the address is registered.">
      <form onSubmit={preventSubmit(() => void form.handleSubmit())}>
        <form.Field name="email" validators={{ onChange: ({ value }) => validateEmail(value) }}>
          {(field) => (
            <label className="auth-field" htmlFor="forgot-email">
              <span>Email</span>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
                <p className="field-error">{field.state.meta.errors.join(', ')}</p>
              ) : null}
            </label>
          )}
        </form.Field>
        <button className="auth-submit" type="submit">
          Send reset link
        </button>
      </form>
      <AuthLinks left={{ to: '/login', label: 'Back to sign in' }} />
    </AuthShell>
  )
}
