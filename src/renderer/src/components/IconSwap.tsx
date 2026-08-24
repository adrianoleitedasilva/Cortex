interface Props {
  outline: React.ReactNode
  solid: React.ReactNode
}

/** Renders both icon variants stacked; CSS (icon-swap / icon-outline / icon-solid in
 * theme.css) crossfades outline -> solid on hover or on an ancestor `.active` class, with
 * no JS hover-state needed. */
export function IconSwap({ outline, solid }: Props): React.JSX.Element {
  return (
    <span className="icon-swap">
      <span className="icon-outline">{outline}</span>
      <span className="icon-solid">{solid}</span>
    </span>
  )
}
