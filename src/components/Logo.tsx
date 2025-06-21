
export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 32 32" 
        className="flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
          </linearGradient>
        </defs>
        <path d="M8 4l8-4 8 4v8l-8 4-8-4V4z" fill="url(#hexGrad)" />
        <path d="M10 20l6-3 6 3v6l-6 3-6-3v-6z" fill="url(#hexGrad)" opacity="0.8" />
        <path d="M4 14l4-2 4 2v4l-4 2-4-2v-4z" fill="url(#hexGrad)" opacity="0.6" />
        <path d="M20 14l4-2 4 2v4l-4 2-4-2v-4z" fill="url(#hexGrad)" opacity="0.6" />
      </svg>
      <span className="font-semibold text-lg text-foreground">TankWiki</span>
    </div>
  );
}
