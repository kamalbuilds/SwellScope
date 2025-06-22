import React from 'react';
import { ComponentProps } from '../types';

interface LoadingSpinnerProps extends ComponentProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'primary', 
  text,
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-blue-500 border-t-transparent',
    secondary: 'border-purple-500 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`} {...props}>
      <div
        className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]}`}
        style={{
          animation: 'spin 1s linear infinite',
        }}
      />
      {text && (
        <p className={`text-gray-300 ${textSizeClasses[size]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 