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

  return (
    <div className={`${sizes[size]} relative ${className}`}>
      <img 
        src="/icon.png" 
        alt="Pare! Logo" 
        className="w-full h-full rounded-xl object-cover"
      />
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
        <h1 className={`${textSizes[size]} font-bold text-foreground leading-none tracking-tight`}>
          Pare!
        </h1>
        <p className={`${subtextSizes[size]} text-muted-foreground mt-0.5`}>
          Transforme seus hábitos
        </p>
      </div>
    </div>
  );
}
