// The bolt logo from the SvelteKit site, cleaned of editor metadata. The CSS filter tints
// the black path to the site teal, as before.
export function Logo() {
  return (
    <svg
      viewBox="65 194.98 72.95 80.04"
      width="50"
      aria-hidden="true"
      style={{
        filter:
          'invert(37%) sepia(73%) saturate(1146%) hue-rotate(150deg) brightness(96%) contrast(95%)'
      }}
    >
      <path
        fillRule="evenodd"
        d="M113.28181,194.98158l-9.44388,37.42136h34.116l-49.4623,42.61549l9.44388,-37.89355h-32.93551zM104.90037,208.4391l-27.38724,23.96384h21.36677zM125.2047,237.12487h-22.54725l-6.02047,24.67213z"
      />
    </svg>
  )
}
