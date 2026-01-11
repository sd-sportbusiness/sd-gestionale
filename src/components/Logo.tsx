interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export function Logo({ size = 'md', showText = false, variant = 'light' }: LogoProps) {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo_sd.jpeg"
        alt="SD Benessere & Sport"
        className={`${sizes[size]} w-auto object-contain rounded-lg`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-lg leading-tight ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            SD Benessere
          </span>
          <span className={`text-xs font-medium tracking-wider ${variant === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
            & SPORT
          </span>
        </div>
      )}
    </div>
  );
}
