import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
