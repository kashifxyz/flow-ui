import { type FormEvent } from 'react'

export function preventSubmit(handler: () => void) {
  return (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handler()
  }
}
