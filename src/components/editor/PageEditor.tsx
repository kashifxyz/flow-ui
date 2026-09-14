import { EditorContent, useEditor, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { EditorToolbar } from './EditorToolbar'

type PageEditorProps = {
  content: JSONContent | string | undefined
  onChange: (json: JSONContent) => void
  onBlur?: () => void
}

/**
 * The page body editor. Content is Tiptap's JSON document — persisted by the
 * caller into the page node's `props.body` field (see DEPENDENCIES.md §33).
 * `content` may also be a plain string once, to seed the editor from a legacy
 * `page.description` value for pages that predate this editor.
 */
export function PageEditor({ content, onChange, onBlur }: PageEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Write something, or press '/' for a menu (coming soon)…" }),
    ],
    content: content || undefined,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    onBlur: () => onBlur?.(),
    editorProps: {
      attributes: { class: 'page-body-content' },
    },
  })

  // Content can arrive asynchronously (the page query resolving after the
  // editor has already mounted) — sync it once without fighting the user's
  // in-progress edits on every parent re-render.
  const contentKey = typeof content === 'string' ? content : JSON.stringify(content)
  useEffect(() => {
    if (!editor) return
    const current = JSON.stringify(editor.getJSON())
    const incoming = typeof content === 'string' ? content : JSON.stringify(content)
    if (incoming !== current && !editor.isFocused) {
      editor.commands.setContent(content || '', { emitUpdate: false })
    }
    // Intentionally keyed on the serialized `contentKey`, not `content` itself
    // (a new object/string identity on every parent render would otherwise
    // re-sync on every keystroke elsewhere on the page).
  }, [editor, contentKey, content])

  if (!editor) {
    return null
  }

  return (
    <div className="page-body">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
