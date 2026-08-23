import React from 'react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const base = "relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl overflow-hidden focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base tracking-wide",
  };

  const variants = {
    primary: "bg-white text-black font-semibold hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98]",
    secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 backdrop-blur-md active:scale-[0.98]",
    outline: "bg-transparent text-white border border-white/15 hover:border-white/40 hover:bg-white/5 active:scale-[0.98]",
    danger: "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 active:scale-[0.98]",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
