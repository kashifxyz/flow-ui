import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Icon } from '../components/icons/Icon'
import { ApiError } from '../api/error'
import { useWorkspaceContext } from '../context/workspace-context'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useCreateInvite } from '../hooks/useCreateInvite'
import { useRevokeInvite } from '../hooks/useRevokeInvite'
import { useRemoveMember } from '../hooks/useRemoveMember'
import { useUpdateMember } from '../hooks/useUpdateMember'
import { useUpdateWorkspace } from '../hooks/useUpdateWorkspace'
import { useWorkspaceInvites } from '../hooks/useWorkspaceInvites'
import { useWorkspaceMembers, type Member } from '../hooks/useWorkspaceMembers'
import { usePageTitle } from '../layout/page-title-context'
import { notifyError, notifySuccess } from '../lib/toast'
import { preventSubmit } from '../lib/form'
import { validateRequired, validateEmail } from '../lib/validation'

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'members', label: 'Members' },
  { key: 'invites', label: 'Invites' },
] as const

type Tab = (typeof TABS)[number]['key']

const ROLE_OPTIONS = ['owner', 'admin', 'member', 'guest'] as const
type Role = (typeof ROLE_OPTIONS)[number]

const MANAGE_ROLES = new Set(['owner', 'admin'])

export function WorkspaceSettingsPage() {
  const { activeWorkspace } = useWorkspaceContext()
  const [tab, setTab] = useState<Tab>('general')
  usePageTitle(activeWorkspace ? `Settings — ${activeWorkspace.name}` : 'Settings')

  if (!activeWorkspace) {
    return (
      <div className="app-canvas">
        <div className="app-empty-card">
          <h2>No workspace selected</h2>
          <p>Create or switch to a workspace to manage its settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-scroll">
      <div className="settings-page">
        <h1 className="settings-title">Workspace settings</h1>
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

        {tab === 'general' ? <GeneralTab workspaceId={activeWorkspace.id} name={activeWorkspace.name} /> : null}
        {tab === 'members' ? <MembersTab workspaceId={activeWorkspace.id} /> : null}
        {tab === 'invites' ? <InvitesTab workspaceId={activeWorkspace.id} /> : null}
      </div>
    </div>
  )
}

function GeneralTab({ workspaceId, name }: { workspaceId: string; name: string }) {
  const updateWorkspace = useUpdateWorkspace(workspaceId)

  const form = useForm({
    defaultValues: { name },
    onSubmit: async ({ value }) => {
      if (value.name === name) return
      try {
        await updateWorkspace.mutateAsync({ name: value.name })
        notifySuccess('Workspace updated')
      } catch (err) {
        notifyError(err instanceof ApiError ? err.message : 'Could not update workspace')
      }
    },
  })

  return (
    <section className="settings-section">
      <h2>Workspace name</h2>
      <form className="settings-inline-form" onSubmit={preventSubmit(() => void form.handleSubmit())}>
        <form.Field name="name" validators={{ onChange: ({ value }) => validateRequired('Workspace name')(value) }}>
          {(field) => (
            <input
              className="workspace-create-input"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
        <button className="btn btn-primary btn-sm" type="submit" disabled={updateWorkspace.isPending}>
          Save
        </button>
      </form>
    </section>
  )
}

function MembersTab({ workspaceId }: { workspaceId: string }) {
  const members = useWorkspaceMembers(workspaceId)
  const me = useCurrentUser()
  const updateMember = useUpdateMember(workspaceId)
  const removeMember = useRemoveMember(workspaceId)

  const myMembership = members.data?.find((m) => m.user_id === me.data?.id)
  const canManage = myMembership ? MANAGE_ROLES.has(myMembership.role) : false

  if (members.isLoading) {
    return <div className="app-loading settings-loading" aria-hidden="true"><span className="spinner" /></div>
  }

  return (
    <section className="settings-section">
      <h2>Members ({members.data?.length ?? 0})</h2>
      <ul className="member-list">
        {(members.data ?? []).map((member: Member) => (
          <li key={member.id} className="member-row">
            <span className="user-avatar" aria-hidden="true">
              {member.display_name.trim().slice(0, 2).toUpperCase() || '?'}
            </span>
            <div className="member-identity">
              <span className="member-name">{member.display_name}</span>
              <span className="member-email">{member.email}</span>
            </div>
            {canManage && member.user_id !== me.data?.id ? (
              <select
                className="member-role-select"
                value={member.role}
                disabled={updateMember.isPending}
                onChange={async (e) => {
                  try {
                    await updateMember.mutateAsync({ userId: member.user_id, body: { role: e.target.value as Role } })
                    notifySuccess('Role updated')
                  } catch (err) {
                    notifyError(err instanceof ApiError ? err.message : 'Could not update role')
                  }
                }}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            ) : (
              <span className="member-role-badge">{member.role}</span>
            )}
            {canManage && member.user_id !== me.data?.id ? (
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                aria-label={`Remove ${member.display_name}`}
                title="Remove member"
                disabled={removeMember.isPending}
                onClick={async () => {
                  try {
                    await removeMember.mutateAsync(member.user_id)
                    notifySuccess('Member removed')
                  } catch (err) {
                    notifyError(err instanceof ApiError ? err.message : 'Could not remove member')
                  }
                }}
              >
                <Icon name="TRASH" size={14} />
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function InvitesTab({ workspaceId }: { workspaceId: string }) {
  const invites = useWorkspaceInvites(workspaceId)
  const createInvite = useCreateInvite(workspaceId)
  const revokeInvite = useRevokeInvite(workspaceId)
  const [lastLink, setLastLink] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { email: '', role: 'member' },
    onSubmit: async ({ value }) => {
      try {
        const invite = await createInvite.mutateAsync({ email: value.email, role: value.role as Role })
        const token = 'token' in invite ? invite.token : undefined
        if (token) {
          setLastLink(`${window.location.origin}/invite?token=${encodeURIComponent(token)}`)
        }
        notifySuccess('Invite created')
        form.reset()
      } catch (err) {
        notifyError(err instanceof ApiError ? err.message : 'Could not create invite')
      }
    },
  })

  const pending = (invites.data ?? []).filter((invite) => !invite.accepted_at && !invite.revoked_at)

  return (
    <section className="settings-section">
      <h2>Invite someone</h2>
      <p className="settings-hint">
        An invite email is sent automatically. If it doesn't arrive, copy the link below and share it with the
        person you're inviting as a backup.
      </p>
      <form className="invite-form" onSubmit={preventSubmit(() => void form.handleSubmit())}>
        <form.Field name="email" validators={{ onChange: ({ value }) => validateEmail(value) }}>
          {(field) => (
            <input
              className="workspace-create-input"
              type="email"
              placeholder="teammate@company.com"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
        <form.Field name="role">
          {(field) => (
            <select
              className="member-role-select"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              {ROLE_OPTIONS.filter((r) => r !== 'owner').map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          )}
        </form.Field>
        <button className="btn btn-primary btn-sm" type="submit" disabled={createInvite.isPending}>
          Send invite
        </button>
      </form>

      {lastLink ? (
        <div className="invite-link-box">
          <input className="invite-link-input" readOnly value={lastLink} onFocus={(e) => e.target.select()} />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              await navigator.clipboard.writeText(lastLink)
              notifySuccess('Link copied')
            }}
          >
            Copy
          </button>
        </div>
      ) : null}

      <h2 className="settings-subheading">Pending invites ({pending.length})</h2>
      <ul className="invite-list">
        {pending.map((invite) => (
          <li key={invite.id} className="invite-row">
            <Icon name="MAIL" size={15} />
            <div className="member-identity">
              <span className="member-name">{invite.email}</span>
              <span className="member-email">Invited as {invite.role}</span>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={revokeInvite.isPending}
              onClick={async () => {
                try {
                  await revokeInvite.mutateAsync(invite.id)
                  notifySuccess('Invite revoked')
                } catch (err) {
                  notifyError(err instanceof ApiError ? err.message : 'Could not revoke invite')
                }
              }}
            >
              Revoke
            </button>
          </li>
        ))}
        {invites.data && pending.length === 0 ? <p className="app-rail-empty">No pending invites.</p> : null}
      </ul>
    </section>
  )
}
