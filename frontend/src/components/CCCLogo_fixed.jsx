import React from 'react';

const CCCLogo = ({ className = "h-8 w-auto", variant = "default" }) => {
  const colors = {
    default: {
      c1: "#293889", // Blue
      c2: "#E91F2C", // Red  
      c3: "#293889"  // Blue
    },
    white: {
      c1: "#FFFFFF",
      c2: "#FFFFFF", 
      c3: "#FFFFFF"
    },
    navy: {
      c1: "#00003D",
      c2: "#00003D",
      c3: "#00003D"
    }
  };
  
  const currentColors = colors[variant] || colors.default;
  
  return (
    <svg
      className={className}
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* First C */}
      <path
        d="M8 32C8 36.4 11.6 40 16 40C18.4 40 20.6 38.8 22 37L18.8 33.2C18 33.8 17 34.2 16 34.2C14.8 34.2 13.8 33.2 13.8 32V8C13.8 6.8 14.8 5.8 16 5.8C17 5.8 18 6.2 18.8 6.8L22 3C20.6 1.2 18.4 0 16 0C11.6 0 8 3.6 8 8V32Z"
        fill={currentColors.c1}
      />
      
      {/* Second C (Red) */}
      <path
        d="M28 32C28 36.4 31.6 40 36 40C38.4 40 40.6 38.8 42 37L38.8 33.2C38 33.8 37 34.2 36 34.2C34.8 34.2 33.8 33.2 33.8 32V8C33.8 6.8 34.8 5.8 36 5.8C37 5.8 38 6.2 38.8 6.8L42 3C40.6 1.2 38.4 0 36 0C31.6 0 28 3.6 28 8V32Z"
        fill={currentColors.c2}
      />
      
      {/* Third C */}
      <path
        d="M48 32C48 36.4 51.6 40 56 40C58.4 40 60.6 38.8 62 37L58.8 33.2C58 33.8 57 34.2 56 34.2C54.8 34.2 53.8 33.2 53.8 32V8C53.8 6.8 54.8 5.8 56 5.8C57 5.8 58 6.2 58.8 6.8L62 3C60.6 1.2 58.4 0 56 0C51.6 0 48 3.6 48 8V32Z"
        fill={currentColors.c3}
      />
      
      {/* Text: CCC (simplified version) */}
      <text
        x="70"
        y="25"
        fontSize="10"
        fontWeight="600"
        fill={currentColors.c1}
        fontFamily="Inter, sans-serif"
      >
        CCC
      </text>
    </svg>
  );
};

export default CCCLogo;