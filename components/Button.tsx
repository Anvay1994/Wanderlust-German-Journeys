import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = "relative font-display tracking-wide font-bold transition-all duration-200 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#059669] text-white hover:bg-[#047857] shadow-md hover:shadow-lg border border-transparent", // Emerald Green
    secondary: "bg-white border border-[#059669] text-[#059669] hover:bg-[#ecfdf5]",
    danger: "bg-[#be123c] text-white hover:bg-[#9f1239] shadow-md", // Rose Red
    ghost: "bg-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-6 py-2 text-sm",
    lg: "px-8 py-3 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;