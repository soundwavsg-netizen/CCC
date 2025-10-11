import React from 'react';

const PageHeader = ({ children, className = "" }) => {
  return (
    <section className={`py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-[#EAF7F5] via-white to-[#EAF7F5] ${className}`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* CCC Logo - Consistent across all pages */}
          <div className="mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_smartbiz-portal/artifacts/p67oqb1l_Screenshot%202025-10-11%20at%204.38.29%20PM.png" 
              alt="Cognition & Competence Consultancy" 
              className="h-20 w-auto object-contain mx-auto"
              style={{ 
                background: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
          </div>
          {children}
        </div>
      </div>
    </section>
  );
};

export default PageHeader;