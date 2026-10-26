const paths = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  tasks: <path d="m3 6 2 2 3-4M11 6h10M11 12h10M11 18h10M3 12h4M3 18h4" />,
  book: <path d="M12 5v16M12 5C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  edit: <path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z" />,
  trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  alert: <path d="m12 3 10 18H2Z M12 9v4M12 17h.01" />,
  refresh: <path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 14 6M4 12a8 8 0 0 0 14 6" />,
  left: <path d="m15 5-7 7 7 7" />,
  right: <path d="m9 5 7 7-7 7" />,
  play: <path d="m8 4 12 8-12 8Z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  home: <path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8" />,
}
export default function Icon({ name, size = 20, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.grid}</svg>
}
