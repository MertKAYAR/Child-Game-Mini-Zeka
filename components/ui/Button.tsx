import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "font-bold rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center border-b-4";
  
  const variants = {
    primary: "bg-blue-400 border-blue-600 text-white hover:bg-blue-300",
    secondary: "bg-purple-400 border-purple-600 text-white hover:bg-purple-300",
    success: "bg-green-400 border-green-600 text-white hover:bg-green-300",
    danger: "bg-red-400 border-red-600 text-white hover:bg-red-300"
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-2xl",
    xl: "p-8 text-4xl w-full h-full"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};