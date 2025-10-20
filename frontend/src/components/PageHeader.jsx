import React from 'react';

const PageHeader = ({ children, className = "", theme = "default" }) => {
  const themes = {
    default: "bg-gradient-to-br from-[#EAF7F5] via-white to-[#EAF7F5]",
    ai: "bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#8B5CF6]",
    services: "bg-gradient-to-br from-[#4facfe] via-[#00f2fe] to-[#06B6D4]", 
    about: "bg-gradient-to-br from-[#a8edea] via-[#fed6e3] to-[#f093fb]",
    contact: "bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#f093fb]",
    portfolio: "bg-gradient-to-br from-[#667eea] via-[#4facfe] to-[#00f2fe]",
    promotion: "bg-gradient-to-br from-[#f093fb] via-[#f5576c] to-[#E91F2C]"
  };

  const gradientClass = themes[theme] || themes.default;
  const isColorful = theme !== 'default';

  return (
    <section className={`py-16 sm:py-20 lg:py-28 ${gradientClass} ${className} relative overflow-hidden`}>
      {/* Animated Background Elements for colorful themes */}
      {isColorful && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 1px, transparent 1px),
                             radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '100px 100px, 80px 80px',
            animation: 'float 20s ease-in-out infinite'
          }}></div>
        </div>
      )}
      
      {/* Floating particles for colorful themes */}
      {isColorful && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-white/20 rounded-full blur-sm"
              style={{
                left: `${10 + i * 10}%`,
                top: `${20 + (i % 3) * 20}%`,
                animation: `float ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* CCC Logo - Consistent across all pages */}
          <div className="mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_smartbiz-portal/artifacts/p67oqb1l_Screenshot%202025-10-11%20at%204.38.29%20PM.png" 
              alt="Cognition & Competence Consultancy" 
              className={`h-20 w-auto object-contain mx-auto rounded-2xl p-4 border ${
                isColorful 
                  ? 'bg-white/10 backdrop-blur-sm border-white/20 drop-shadow-[0_8px_32px_rgba(139,92,246,0.4)]' 
                  : 'bg-transparent border-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]'
              }`}
            />
          </div>
          <div className={isColorful ? 'text-white' : 'text-[hsl(var(--foreground))]'}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageHeader;