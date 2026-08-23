import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glowing' | 'subtle';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyle = "relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-300";
  
  const variants = {
    default: "bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/[0.15]",
    glowing: "bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:border-white/30",
    subtle: "bg-black/40 border border-white/[0.05] hover:border-white/[0.1]",
  };

  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
