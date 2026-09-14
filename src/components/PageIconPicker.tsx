import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from './icons/Icon'

const CURATED_EMOJI = [
  '📄', '📝', '📋', '📌', '📎', '🗂️', '📁', '📊',
  '📈', '💡', '🎯', '🚀', '✅', '⭐', '🔥', '🧭',
  '🛠️', '🧩', '📅', '⏰', '💬', '📣', '🔗', '🏷️',
]

export function PageIconPicker({ icon, onSelect }: { icon: string | null | undefined; onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()

  const closeAndRefocusTrigger = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    // Move focus to the first menu item, per the WAI-ARIA menu-button pattern.
    itemRefs.current[0]?.focus()

    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const items = icon ? [...CURATED_EMOJI, 'remove'] : CURATED_EMOJI

  const onMenuKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeAndRefocusTrigger()
      return
    }
    const currentIndex = itemRefs.current.findIndex((el) => el === document.activeElement)
    let nextIndex: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    } else if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = items.length - 1
    }
    if (nextIndex !== null) {
      e.preventDefault()
      itemRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div className="page-icon-picker" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        className="page-icon-trigger"
        aria-label={icon ? 'Change page icon' : 'Add page icon'}
        title={icon ? 'Change icon' : 'Add icon'}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {icon ? <span className="page-icon-emoji">{icon}</span> : <Icon name="PAGE" size={26} />}
      </button>
      {open ? (
        <div id={menuId} className="page-icon-popover" role="menu" onKeyDown={onMenuKeyDown}>
          <div className="page-icon-grid">
            {CURATED_EMOJI.map((emoji, index) => (
              <button
                key={emoji}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="page-icon-option"
                onClick={() => {
                  onSelect(emoji)
                  closeAndRefocusTrigger()
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          {icon ? (
            <button
              ref={(el) => {
                itemRefs.current[CURATED_EMOJI.length] = el
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className="page-icon-remove"
              onClick={() => {
                onSelect('')
                closeAndRefocusTrigger()
              }}
            >
              Remove icon
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
