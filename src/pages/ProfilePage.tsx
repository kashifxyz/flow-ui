import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Icon } from '../components/icons/Icon'
import { ApiError } from '../api/error'
import { useChangePassword } from '../hooks/useChangePassword'
import { useProfile } from '../hooks/useProfile'
import { useRevokeSession } from '../hooks/useRevokeSession'
import { useSessions } from '../hooks/useSessions'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import { usePageTitle } from '../layout/page-title-context'
import { notifyError, notifySuccess } from '../lib/toast'
import { preventSubmit } from '../lib/form'
import { friendlyUserAgent } from '../lib/userAgent'
import { validateNewPassword, validateRequired } from '../lib/validation'

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'security', label: 'Security' },
  { key: 'sessions', label: 'Sessions' },
] as const

type Tab = (typeof TABS)[number]['key']

export function ProfilePage() {
  const [tab, setTab] = useState<Tab>('general')
  usePageTitle('Your profile')

  return (
    <div className="page-scroll">
      <div className="settings-page">
        <h1 className="settings-title">Your profile</h1>
        <div className="settings-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={tab === t.key ? 'settings-tab active' : 'settings-tab'}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'general' ? <GeneralTab /> : null}
        {tab === 'security' ? <SecurityTab /> : null}
        {tab === 'sessions' ? <SessionsTab /> : null}
      </div>
    </div>
  )
}

function GeneralTab() {
  const profile = useProfile()
  const updateProfile = useUpdateProfile()

  if (profile.isLoading) {
    return <div className="app-loading settings-loading" aria-hidden="true"><span className="spinner" /></div>
  }
  if (!profile.data) {
    return <p className="settings-hint">Could not load your profile.</p>
  }

  return <GeneralForm profile={profile.data} updateProfile={updateProfile} />
}

function GeneralForm({
  profile,
  updateProfile,
}: {
  profile: NonNullable<ReturnType<typeof useProfile>['data']>
  updateProfile: ReturnType<typeof useUpdateProfile>
}) {
  const form = useForm({
    defaultValues: {
      display_name: profile.display_name,
      given_name: profile.given_name,
      family_name: profile.family_name,
      bio: profile.bio,
    },
    onSubmit: async ({ value }) => {
      // Only send fields the user actually changed from what loaded — sending
      // the whole snapshot would silently overwrite a field someone else (or
      // another tab) changed on the server in the meantime.
      const patch: Partial<typeof value> = {}
      if (value.display_name !== profile.display_name) patch.display_name = value.display_name
      if (value.given_name !== profile.given_name) patch.given_name = value.given_name
      if (value.family_name !== profile.family_name) patch.family_name = value.family_name
      if (value.bio !== profile.bio) patch.bio = value.bio

      if (Object.keys(patch).length === 0) {
        notifySuccess('Nothing to update')
        return
      }

      try {
        await updateProfile.mutateAsync(patch)
        notifySuccess('Profile updated')
      } catch (err) {
        notifyError(err instanceof ApiError ? err.message : 'Could not update profile')
      }
    },
  })

  return (
    <section className="settings-section">
      <h2>Identity</h2>
      <form
        className="profile-form"
        onSubmit={preventSubmit(() => void form.handleSubmit())}
      >
        <div className="profile-avatar-row">
          <span className="user-avatar profile-avatar" aria-hidden="true">
            {profile.display_name.trim().slice(0, 2).toUpperCase() || '?'}
          </span>
          <div>
            <p className="profile-email">{profile.email}</p>
            <p className="settings-hint" style={{ margin: 0 }}>
              Avatar upload isn't available yet.
            </p>
          </div>
        </div>

        <form.Field name="display_name" validators={{ onChange: ({ value }) => validateRequired('Display name')(value) }}>
          {(field) => (
            <label className="profile-field">
              <span>Display name</span>
              <input
                className="workspace-create-input"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
                <span className="field-error">{field.state.meta.errors.join(', ')}</span>
              ) : null}
            </label>
          )}
        </form.Field>

        <div className="profile-field-row">
          <form.Field name="given_name">
            {(field) => (
              <label className="profile-field">
                <span>First name</span>
                <input
                  className="workspace-create-input"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </label>
            )}
          </form.Field>
          <form.Field name="family_name">
            {(field) => (
              <label className="profile-field">
                <span>Last name</span>
                <input
                  className="workspace-create-input"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </label>
            )}
          </form.Field>
        </div>

        <form.Field name="bio">
          {(field) => (
            <label className="profile-field">
              <span>Bio</span>
              <textarea
                className="workspace-create-input profile-bio-input"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={3}
              />
            </label>
          )}
        </form.Field>

        <button className="btn btn-primary btn-sm" type="submit" disabled={updateProfile.isPending}>
          Save changes
        </button>
      </form>
    </section>
  )
}

function SecurityTab() {
  const changePassword = useChangePassword()

  const form = useForm({
    defaultValues: { current_password: '', new_password: '' },
    onSubmit: async ({ value }) => {
      try {
        await changePassword.mutateAsync(value)
        notifySuccess('Password changed. You were signed out everywhere else.')
        form.reset()
      } catch (err) {
        notifyError(err instanceof ApiError ? err.message : 'Could not change password')
      }
    },
  })

  return (
    <section className="settings-section">
      <h2>Change password</h2>
      <p className="settings-hint">Changing your password signs you out on every other device, but keeps this session.</p>
      <form className="profile-form" onSubmit={preventSubmit(() => void form.handleSubmit())}>
        <form.Field name="current_password" validators={{ onChange: ({ value }) => validateRequired('Current password')(value) }}>
          {(field) => (
            <label className="profile-field">
              <span>Current password</span>
              <input
                type="password"
                autoComplete="current-password"
                className="workspace-create-input"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
                <span className="field-error">{field.state.meta.errors.join(', ')}</span>
              ) : null}
            </label>
          )}
        </form.Field>
        <form.Field name="new_password" validators={{ onChange: ({ value }) => validateNewPassword(value) }}>
          {(field) => (
            <label className="profile-field">
              <span>New password</span>
              <input
                type="password"
                autoComplete="new-password"
                className="workspace-create-input"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
                <span className="field-error">{field.state.meta.errors.join(', ')}</span>
              ) : null}
            </label>
          )}
        </form.Field>
        <button className="btn btn-primary btn-sm" type="submit" disabled={changePassword.isPending}>
          Change password
        </button>
      </form>
    </section>
  )
}

function SessionsTab() {
  const sessions = useSessions()
  const revokeSession = useRevokeSession()

  if (sessions.isLoading) {
    return <div className="app-loading settings-loading" aria-hidden="true"><span className="spinner" /></div>
  }

  return (
    <section className="settings-section">
      <h2>Active sessions</h2>
      <ul className="member-list">
        {(sessions.data ?? []).map((session) => (
          <li key={session.id} className="member-row">
            <Icon name="LOCK" size={15} />
            <div className="member-identity">
              <span className="member-name">{friendlyUserAgent(session.user_agent)}</span>
              <span className="member-email">
                {session.ip || 'Unknown location'} · last active {new Date(session.last_seen_at).toLocaleString()}
              </span>
            </div>
            {session.current ? <span className="session-current-badge">This device</span> : null}
            {!session.current ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={revokeSession.isPending}
                onClick={async () => {
                  try {
                    await revokeSession.mutateAsync(session.id)
                    notifySuccess('Session revoked')
                  } catch (err) {
                    notifyError(err instanceof ApiError ? err.message : 'Could not revoke session')
                  }
                }}
              >
                Revoke
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
