import { Icon } from '../icons/Icon'

type ToastKind = 'success' | 'error'

export function ToastCard({
  kind,
  message,
  visible,
  onDismiss,
}: {
  kind: ToastKind
  message: string
  visible: boolean
  onDismiss: () => void
}) {
  return (
    <div className={`toast-card toast-${kind} ${visible ? 'toast-in' : 'toast-out'}`} role="status">
      <span className="toast-icon">
        <Icon name={kind === 'success' ? 'CHECK' : 'ALERT'} size={15} />
      </span>
      <p className="toast-message">{message}</p>
      <button type="button" className="toast-dismiss" onClick={onDismiss} aria-label="Dismiss">
        <Icon name="CLOSE" size={13} />
      </button>
    </div>
  )
}
