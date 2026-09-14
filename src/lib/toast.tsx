import toast from 'react-hot-toast'
import { ToastCard } from '../components/feedback/ToastCard'

// The one place the app talks to react-hot-toast directly — every call site
// should use notifySuccess/notifyError instead of importing `toast` itself,
// so styling and behavior stay consistent (DEPENDENCIES.md §23).
//
// `id` is keyed on kind+message so repeating the same notification (e.g. a
// user mashing "sign in" with the wrong password several times) refreshes one
// toast in place instead of stacking a wall of identical ones — genuinely
// different messages still get their own toast.
function notify(kind: 'success' | 'error', message: string) {
  toast.custom((t) => <ToastCard kind={kind} message={message} visible={t.visible} onDismiss={() => toast.dismiss(t.id)} />, {
    id: `${kind}:${message}`,
  })
}

export const notifySuccess = (message: string) => notify('success', message)
export const notifyError = (message: string) => notify('error', message)
