interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-5xl",
  };

  return (
    <div className={`${sizes[size]} relative ${className}`}>
      {/* Background Circle with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 rounded-2xl shadow-2xl">
        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl"></div>
      </div>
      
      {/* Stop hand icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 text-white drop-shadow-lg"
        >
          {/* Hand/Stop gesture */}
          <path
            d="M12 2C11.4477 2 11 2.44772 11 3V12M12 2C12.5523 2 13 2.44772 13 3V12M12 2V12M12 12L9 12C8.44772 12 8 12.4477 8 13C8 13.5523 8.44772 14 9 14H12M12 12L15 12C15.5523 12 16 12.4477 16 13C16 13.5523 15.5523 14 15 14H12M12 12V20C12 21.1046 11.1046 22 10 22H14C12.8954 22 12 21.1046 12 20V12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Prohibition circle */}
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Diagonal prohibition line */}
          <line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Shine effect */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl"></div>
    </div>
  );
}

interface LogoWithTextProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LogoWithText({ size = "md", className = "" }: LogoWithTextProps) {
  const logoSizes = {
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  const subtextSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={logoSizes[size]} />
      <div>
        <h1 className={`${textSizes[size]} font-bold bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent leading-none`}>
          Pare!
        </h1>
        <p className={`${subtextSizes[size]} text-gray-500 mt-0.5`}>
          Transforme seus hábitos
        </p>
      </div>
    </div>
  );
}
