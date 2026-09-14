import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './icons/Icon'

type ModalProps = {
  title: string
  onClose: () => void
  children: React.ReactNode
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ title, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  // Read the latest onClose from a ref rather than the effect's dependency
  // array: callers typically pass an inline arrow function (a new identity on
  // every render of the caller, e.g. WorkspaceSwitcher), and re-running the
  // setup/teardown below on every such render would re-capture and yank focus
  // away from wherever the user currently is (e.g. mid-keystroke in a form)
  // back to the panel's first focusable element. The trap itself only needs
  // to run once, on mount.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Trap focus inside the panel, move focus in on open, and restore it to
  // whatever triggered the modal on close — per the WAI-ARIA dialog pattern.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const focusable = panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : []
    ;(focusable[0] ?? panel)?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !panel) return

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally mount-only, see onCloseRef above
  }, [])

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={title} ref={panelRef} tabIndex={-1}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={onClose}>
            <Icon name="CLOSE" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
