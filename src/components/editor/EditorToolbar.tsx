import type { Editor } from '@tiptap/react'
import { Icon, type IconName } from '../icons/Icon'

type ToolbarButton = {
  name: string
  label: string
  icon: IconName
  isActive: (editor: Editor) => boolean
  run: (editor: Editor) => void
}

const GROUPS: ToolbarButton[][] = [
  [
    { name: 'undo', label: 'Undo', icon: 'UNDO', isActive: () => false, run: (e) => e.chain().focus().undo().run() },
    { name: 'redo', label: 'Redo', icon: 'REDO', isActive: () => false, run: (e) => e.chain().focus().redo().run() },
  ],
  [
    {
      name: 'h1',
      label: 'Heading 1',
      icon: 'HEADING_1',
      isActive: (e) => e.isActive('heading', { level: 1 }),
      run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      name: 'h2',
      label: 'Heading 2',
      icon: 'HEADING_2',
      isActive: (e) => e.isActive('heading', { level: 2 }),
      run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      name: 'h3',
      label: 'Heading 3',
      icon: 'HEADING_3',
      isActive: (e) => e.isActive('heading', { level: 3 }),
      run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    },
  ],
  [
    { name: 'bold', label: 'Bold', icon: 'BOLD', isActive: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
    {
      name: 'italic',
      label: 'Italic',
      icon: 'ITALIC',
      isActive: (e) => e.isActive('italic'),
      run: (e) => e.chain().focus().toggleItalic().run(),
    },
    {
      name: 'strike',
      label: 'Strikethrough',
      icon: 'STRIKETHROUGH',
      isActive: (e) => e.isActive('strike'),
      run: (e) => e.chain().focus().toggleStrike().run(),
    },
    {
      name: 'code',
      label: 'Inline code',
      icon: 'CODE_BLOCK',
      isActive: (e) => e.isActive('code'),
      run: (e) => e.chain().focus().toggleCode().run(),
    },
    {
      name: 'link',
      label: 'Link',
      icon: 'LINK',
      isActive: (e) => e.isActive('link'),
      run: (e) => {
        const previous = e.getAttributes('link').href as string | undefined
        const url = window.prompt('Link URL', previous ?? 'https://')
        if (url === null) return
        if (url === '') {
          e.chain().focus().extendMarkRange('link').unsetLink().run()
          return
        }
        e.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      },
    },
  ],
  [
    {
      name: 'bulletList',
      label: 'Bullet list',
      icon: 'BULLET_LIST',
      isActive: (e) => e.isActive('bulletList'),
      run: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
      name: 'orderedList',
      label: 'Numbered list',
      icon: 'ORDERED_LIST',
      isActive: (e) => e.isActive('orderedList'),
      run: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
      name: 'blockquote',
      label: 'Quote',
      icon: 'QUOTE',
      isActive: (e) => e.isActive('blockquote'),
      run: (e) => e.chain().focus().toggleBlockquote().run(),
    },
    {
      name: 'codeBlock',
      label: 'Code block',
      icon: 'CODE_BLOCK',
      isActive: (e) => e.isActive('codeBlock'),
      run: (e) => e.chain().focus().toggleCodeBlock().run(),
    },
    {
      name: 'divider',
      label: 'Divider',
      icon: 'DIVIDER',
      isActive: () => false,
      run: (e) => e.chain().focus().setHorizontalRule().run(),
    },
  ],
]

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatting">
      {GROUPS.map((group, i) => (
        <div className="editor-toolbar-group" key={i}>
          {group.map((btn) => (
            <button
              key={btn.name}
              type="button"
              className={btn.isActive(editor) ? 'editor-toolbar-btn active' : 'editor-toolbar-btn'}
              aria-label={btn.label}
              aria-pressed={btn.isActive(editor)}
              title={btn.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => btn.run(editor)}
            >
              <Icon name={btn.icon} size={15} />
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
