import toast from 'react-hot-toast'
import { ToastCard } from '../components/feedback/ToastCard'

// The one place the app talks to react-hot-toast directly — every call site
// should use notifySuccess/notifyError instead of importing `toast` itself,
// so styling and behavior stay consistent (DEPENDENCIES.md §23).
function notify(kind: 'success' | 'error', message: string) {
  toast.custom((t) => <ToastCard kind={kind} message={message} visible={t.visible} onDismiss={() => toast.dismiss(t.id)} />)
}

export const notifySuccess = (message: string) => notify('success', message)
export const notifyError = (message: string) => notify('error', message)
