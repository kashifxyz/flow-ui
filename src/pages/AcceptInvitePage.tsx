import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { Icon } from '../components/icons/Icon'
import { AuthLinks, AuthShell } from '../auth/AuthUI'
import { Wordmark } from '../components/Wordmark'
import { ThemeSwitch } from '../components/ThemeSwitch'
import { ApiError } from '../api/error'
import { useAcceptInvite } from '../hooks/useAcceptInvite'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { notifyError, notifySuccess } from '../lib/toast'

function SignedInCard({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="auth-shell auth-shell-solo">
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-top">
            <Wordmark to="/app" />
            <ThemeSwitch />
          </div>
          <h1>{title}</h1>
          <p className="lead">{lead}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export function AcceptInvitePage() {
  const { token } = useSearch({ from: '/invite' })
  const me = useCurrentUser()
  const acceptInvite = useAcceptInvite()
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)

  if (!token) {
    return (
      <SignedInCard title="Invalid invite link" lead="This invite link is missing its token. Ask for a new one.">
        <Link className="auth-submit" to="/">
          Go home
        </Link>
      </SignedInCard>
    )
  }

  if (me.isLoading) {
    return (
      <SignedInCard title="Loading…" lead="">
        <div className="app-loading" aria-hidden="true">
          <span className="spinner" />
        </div>
      </SignedInCard>
    )
  }

  if (me.isError) {
    return (
      <SignedInCard title="Couldn't check your session" lead="Something went wrong reaching the server. Check your connection and try again.">
        <button className="auth-submit" type="button" onClick={() => void me.refetch()}>
          Retry
        </button>
      </SignedInCard>
    )
  }

  // AuthShell redirects to /app whenever a session exists, which is exactly the
  // state this page needs to render for — only the logged-out branch can use it.
  if (!me.data) {
    const next = `/invite?token=${encodeURIComponent(token)}`
    return (
      <AuthShell title="You've been invited" lead="Sign in (or create an account) to accept this workspace invite.">
        <Link className="auth-submit" to="/login" search={{ next }}>
          Sign in
        </Link>
        <AuthLinks left={{ to: '/register', label: 'Create an account instead' }} />
      </AuthShell>
    )
  }

  if (accepted) {
    return (
      <SignedInCard title="You're in" lead="The workspace has been added to your account.">
        <button className="auth-submit" type="button" onClick={() => navigate({ to: '/app' })}>
          Go to workspace
        </button>
      </SignedInCard>
    )
  }

  return (
    <SignedInCard title="You've been invited" lead={`Accept this invite as ${me.data.display_name}?`}>
      <button
        className="auth-submit"
        type="button"
        disabled={acceptInvite.isPending}
        onClick={async () => {
          try {
            await acceptInvite.mutateAsync(token)
            notifySuccess('Invite accepted')
            setAccepted(true)
          } catch (err) {
            notifyError(err instanceof ApiError ? err.message : 'Could not accept invite')
          }
        }}
      >
        <Icon name="CHECK" size={16} />
        Accept invite
      </button>
    </SignedInCard>
  )
}
