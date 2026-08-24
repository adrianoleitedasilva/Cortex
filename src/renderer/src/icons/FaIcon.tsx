import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getFaIcon } from './faCatalog'

interface Props {
  name: string
  className?: string
}

export function FaIcon({ name, className }: Props): React.JSX.Element | null {
  const definition = getFaIcon(name)
  if (!definition) return null
  return <FontAwesomeIcon icon={definition} className={className} fixedWidth />
}
