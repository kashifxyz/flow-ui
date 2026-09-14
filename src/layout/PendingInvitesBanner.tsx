import { useState } from 'react'
import { Icon } from '../components/icons/Icon'
import { ApiError } from '../api/error'
import { useAcceptInviteById } from '../hooks/useAcceptInviteById'
import { useMyInvites } from '../hooks/useMyInvites'
import { notifyError, notifySuccess } from '../lib/toast'

/**
 * Surfaces workspace invites addressed to the current user's email directly in
 * the app shell — accepting an invite must not depend on the invitee having
 * received or clicked an emailed link (see FEATURES.md's invite-visibility gap).
 */
export function PendingInvitesBanner() {
  const invites = useMyInvites()
  const acceptInvite = useAcceptInviteById()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = (invites.data ?? []).filter((invite) => !dismissed.has(invite.id))
  if (visible.length === 0) {
    return null
  }

  return (
    <div className="invite-banner-stack">
      {visible.map((invite) => (
        <div key={invite.id} className="invite-banner">
          <Icon name="MAIL" size={16} />
          <span className="invite-banner-text">
            <strong>{invite.workspace_name}</strong> invited you to join as {invite.role}
            {invite.invited_by_name ? ` (from ${invite.invited_by_name})` : ''}.
          </span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={acceptInvite.isPending}
            onClick={async () => {
              try {
                await acceptInvite.mutateAsync({ workspaceId: invite.workspace_id, inviteId: invite.id })
                notifySuccess(`Joined ${invite.workspace_name}`)
              } catch (err) {
                notifyError(err instanceof ApiError ? err.message : 'Could not accept invite')
              }
            }}
          >
            Accept
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            aria-label="Dismiss for now"
            title="Dismiss for now"
            onClick={() => setDismissed((prev) => new Set(prev).add(invite.id))}
          >
            <Icon name="CLOSE" size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
