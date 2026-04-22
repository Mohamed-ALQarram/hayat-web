const HayatLogo = ({ className = '', size = 'md', variant = 'light', showText = true }) => {
  const sizes = {
    xs: { icon: 28, text: 'text-[10px]', sub: 'text-[7px]', gap: 'gap-0.5' },
    sm: { icon: 36, text: 'text-xs', sub: 'text-[8px]', gap: 'gap-1' },
    md: { icon: 48, text: 'text-sm', sub: 'text-[9px]', gap: 'gap-1.5' },
    lg: { icon: 72, text: 'text-xl', sub: 'text-[11px]', gap: 'gap-2' },
    xl: { icon: 100, text: 'text-3xl', sub: 'text-xs', gap: 'gap-3' },
  };

  const s = sizes[size] || sizes.md;
  const isLight = variant === 'light';
  const primaryColor = isLight ? '#FFFFFF' : '#0F3460';
  const secondaryColor = isLight ? 'rgba(255,255,255,0.5)' : '#8B99AB';

  return (
    <div className={`flex flex-col items-center ${s.gap} ${className}`}>
      {/* SVG Icon */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Left pillar of H */}
        <rect x="18" y="12" width="22" height="96" rx="4" fill={primaryColor} />
        {/* Right pillar of H */}
        <rect x="80" y="12" width="22" height="96" rx="4" fill={primaryColor} />
        {/* Heartbeat/pulse line connecting the H */}
        <path
          d="M40 60 L50 60 L55 42 L60 78 L65 38 L70 72 L75 55 L80 60"
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Elliptical arc - stethoscope sweep */}
        <ellipse
          cx="60"
          cy="55"
          rx="38"
          ry="18"
          stroke={primaryColor}
          strokeWidth="3"
          fill="none"
          opacity="0.2"
          strokeDasharray="4 6"
        />
      </svg>

      {/* Text */}
      {showText && (
        <div className="text-center leading-tight">
          <p
            className={`${s.text} font-extrabold tracking-wide`}
            style={{ color: primaryColor, letterSpacing: '0.15em' }}
          >
            HAYAT
          </p>
          <p
            className={`${s.sub} font-medium mt-0.5`}
            style={{ color: secondaryColor }}
          >
            | حيــاة |
          </p>
        </div>
      )}
    </div>
  );
};

export default HayatLogo;
