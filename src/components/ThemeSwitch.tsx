import { Icon } from './icons/Icon'
import { useTheme } from '../theme/context'

const LABEL = {
  light: 'Light',
  dark: 'Dark',
  amoled: 'AMOLED',
} as const

export function ThemeSwitch() {
  const { theme, cycleTheme } = useTheme()
  const icon = theme === 'light' ? 'SUN' : theme === 'dark' ? 'MOON' : 'AMOLED'

  return (
    <button type="button" className="theme-switch" onClick={cycleTheme} aria-label={`Theme: ${LABEL[theme]}. Click to change.`}>
      <Icon name={icon} size={18} />
      <span>{LABEL[theme]}</span>
    </button>
  )
}
