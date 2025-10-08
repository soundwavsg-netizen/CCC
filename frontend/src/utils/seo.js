// SEO and Schema markup utility for CCC website
// Provides structured data and meta tags for better search engine visibility

// Organization Schema (for all pages)
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Cognition & Competence Consultancy Pte Ltd",
  "alternateName": "CCC",
  "url": "https://smartbiz-portal.preview.emergentagent.com",
  "logo": "https://smartbiz-portal.preview.emergentagent.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "areaServed": "SG",
    "availableLanguage": "English"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "Singapore"
  },
  "sameAs": [
    // Add LinkedIn, Facebook etc when available
  ],
  "description": "Singapore's leading digital transformation consultancy specializing in AI-powered websites, web applications, e-commerce solutions, and government grant support (EDG).",
  "founders": [
    {
      "@type": "Person",
      "name": "CCC Team"
    }
  ],
  "knowsAbout": [
    "Web Development",
    "AI Automation",
    "E-commerce Solutions", 
    "Enterprise Development Grant",
    "EDG",
    "Digital Transformation",
    "Progressive Web Apps"
  ],
  "serviceArea": "Singapore"
});

// FAQ Schema (for homepage and EDG page)
export const getFAQSchema = (faqItems) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Service Schema (for services page)
export const getServiceSchema = (service) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "description": service.description,
  "provider": {
    "@type": "Organization",
    "name": "Cognition & Competence Consultancy Pte Ltd"
  },
  "areaServed": "Singapore",
  "serviceType": service.type || "Digital Transformation"
});

// WebPage Schema (for all pages)
export const getWebPageSchema = (pageData) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": pageData.title,
  "description": pageData.description,
  "url": pageData.url,
  "isPartOf": {
    "@type": "WebSite",
    "name": "Cognition & Competence Consultancy",
    "url": "https://smartbiz-portal.preview.emergentagent.com"
  },
  "author": {
    "@type": "Organization",
    "name": "Cognition & Competence Consultancy Pte Ltd"
  },
  "dateModified": new Date().toISOString(),
  "inLanguage": "en-SG"
});

// Government Grant Schema (for EDG and Grants pages)
export const getGrantSchema = () => ({
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  "name": "Enterprise Development Grant (EDG) Support",
  "description": "Professional assistance with EDG applications for digital transformation projects in Singapore",
  "provider": {
    "@type": "Organization", 
    "name": "Cognition & Competence Consultancy Pte Ltd"
  },
  "serviceArea": "Singapore",
  "audience": {
    "@type": "BusinessAudience",
    "audienceType": "SME"
  },
  "category": "Government Grant Support",
  "offers": {
    "@type": "Offer",
    "description": "Complete EDG application and project management support",
    "areaServed": "Singapore"
  }
});

// Utility function to inject schema into page head
export const injectSchema = (schemaObject) => {
  if (typeof window === 'undefined') return; // Skip on server-side
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schemaObject);
  document.head.appendChild(script);
};

// Utility function to set page meta tags
export const setPageMeta = (metaData) => {
  if (typeof window === 'undefined') return;
  
  // Update title
  if (metaData.title) {
    document.title = metaData.title;
  }
  
  // Update meta description
  if (metaData.description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = metaData.description;
    }
  }
  
  // Update Open Graph tags
  if (metaData.ogTitle) {
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.content = metaData.ogTitle;
    }
  }
  
  if (metaData.ogDescription) {
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.content = metaData.ogDescription;
    }
  }
  
  if (metaData.ogUrl) {
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.content = metaData.ogUrl;
    }
  }
};

// Default page data for common pages
export const pageMetaData = {
  home: {
    title: "CCC — EDG-Funded AI Websites & Web Apps (Singapore)",
    description: "We design and build AI-powered websites/web apps and help you apply for up to 50% EDG funding. Chat with our AI consultant.",
    ogTitle: "Build Your Website or App with up to 50% EDG Funding",
    ogDescription: "We design, build, and handle the EDG paperwork—so you get results in weeks, not months.",
    ogUrl: "https://smartbiz-portal.preview.emergentagent.com"
  },
  edg: {
    title: "EDG Funding for Digital Projects | CCC Singapore",
    description: "Get up to 50% EDG funding for your custom website, e-commerce platform, or web app. Complete support from application to delivery.",
    ogTitle: "Get Up to 50% EDG Funding for Your Digital Project",
    ogDescription: "Transform your business with a custom website, e-commerce platform, or web app. We handle both the development and the EDG paperwork.",
    ogUrl: "https://smartbiz-portal.preview.emergentagent.com/edg"
  },
  services: {
    title: "Digital Services & Solutions | CCC Singapore",
    description: "Complete digital solutions: AI-powered websites, e-commerce platforms, Progressive Web Apps, and AI automation for Singapore SMEs.",
    ogTitle: "Complete Digital Solutions for Your Business",
    ogDescription: "From websites to AI automation, CCC delivers tailored solutions that help Singapore SMEs grow and succeed.",
    ogUrl: "https://smartbiz-portal.preview.emergentagent.com/services-solutions"
  },
  grants: {
    title: "EDG & SFEC Grant Support | CCC Singapore",
    description: "Expert guidance for Enterprise Development Grant and SFEC applications. Maximize your funding potential for digital transformation projects.",
    ogTitle: "EDG & SFEC Grant Support",
    ogDescription: "Access up to 50% funding support from Enterprise Singapore with professional grant application assistance.",
    ogUrl: "https://smartbiz-portal.preview.emergentagent.com/grants"
  },
  contact: {
    title: "Contact CCC | Digital Transformation Consultancy Singapore",
    description: "Get in touch with Singapore's leading digital transformation consultancy. Free consultation for your web development and AI automation needs.",
    ogTitle: "Contact CCC for Digital Transformation",
    ogDescription: "Ready to transform your business? Let's discuss your digital project and government grant opportunities.",
    ogUrl: "https://smartbiz-portal.preview.emergentagent.com/contact"
  }
};

export default {
  getOrganizationSchema,
  getFAQSchema,
  getServiceSchema,
  getWebPageSchema,
  getGrantSchema,
  injectSchema,
  setPageMeta,
  pageMetaData
};