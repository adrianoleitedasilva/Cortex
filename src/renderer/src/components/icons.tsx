interface IconProps {
  className?: string
}

const svgProps = {
  viewBox: '0 0 20 20',
  xmlns: 'http://www.w3.org/2000/svg'
}

export function FolderOutline({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="none" className={className}>
      <path
        d="M2.5 5.6a1 1 0 0 1 1-1h3.7l1.5 1.7h7.3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-12.5a1 1 0 0 1-1-1V5.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FolderSolid({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="currentColor" className={className}>
      <path d="M2.5 5.6a1 1 0 0 1 1-1h3.7l1.5 1.7h7.3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-12.5a1 1 0 0 1-1-1V5.6Z" />
    </svg>
  )
}

export function FileOutline({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="none" className={className}>
      <path
        d="M5.5 2.5h6l3 3v11a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M11.5 2.5v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

export function SearchOutline({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="none" className={className}>
      <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.4" />
      <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function SearchSolid({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="none" className={className}>
      <circle cx="8.5" cy="8.5" r="5" fill="currentColor" />
      <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function TagOutline({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="none" className={className}>
      <rect x="3" y="6" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="7" cy="10.5" r="1" fill="currentColor" />
      <line x1="10" y1="10.5" x2="14" y2="10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function TagSolid({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="none" className={className}>
      <rect x="3" y="6" width="14" height="9" rx="2" fill="currentColor" />
      <circle cx="7" cy="10.5" r="1" fill="var(--color-bg)" />
      <line x1="10" y1="10.5" x2="14" y2="10.5" stroke="var(--color-bg)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function StarOutline({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="none" className={className}>
      <path
        d="M10 2.8l2.1 4.4 4.8.6-3.5 3.4.9 4.8L10 13.6l-4.3 2.4.9-4.8-3.5-3.4 4.8-.6L10 2.8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StarSolid({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="currentColor" className={className}>
      <path d="M10 2.8l2.1 4.4 4.8.6-3.5 3.4.9 4.8L10 13.6l-4.3 2.4.9-4.8-3.5-3.4 4.8-.6L10 2.8Z" />
    </svg>
  )
}

export function ClockOutline({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="none" className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6v4.3l3 1.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ClockSolid({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="none" className={className}>
      <circle cx="10" cy="10" r="7" fill="currentColor" />
      <path
        d="M10 6v4.3l3 1.7"
        stroke="var(--color-bg)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LinkOutline({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="none" className={className}>
      <rect x="2.5" y="2.5" width="9" height="9" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="8.5" width="9" height="9" rx="3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function LinkSolid({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...svgProps} fill="currentColor" className={className}>
      <rect x="2.5" y="2.5" width="9" height="9" rx="3" opacity="0.85" />
      <rect x="8.5" y="8.5" width="9" height="9" rx="3" opacity="0.85" />
    </svg>
  )
}
