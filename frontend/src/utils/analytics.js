// Analytics utility functions for GA4 and Meta Pixel tracking
// This file provides unified tracking for all events across the application

// Initialize tracking - called on app load
export const initializeTracking = () => {
  // Initialize GA4
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID || 'G-XXXXXXX';
  
  // Add GA4 script if not already loaded
  if (!window.gtag && ga4Id !== 'G-XXXXXXX') {
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(script1);
    
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${ga4Id}');
    `;
    document.head.appendChild(script2);
    
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
  }
  
  // Initialize Meta Pixel
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || '000000000000000';
  
  if (!window.fbq && pixelId !== '000000000000000') {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }
};

// Generic event tracking function
export const trackEvent = (eventName, eventData = {}) => {
  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];
  
  // Push to dataLayer for GA4
  window.dataLayer.push({
    event: eventName,
    ...eventData,
    timestamp: new Date().toISOString()
  });
  
  // Map specific events to Meta Pixel
  if (window.fbq) {
    switch (eventName) {
      case 'view_hero_cta':
        window.fbq('track', 'ViewContent', {
          content_name: 'Hero CTA',
          content_category: 'Landing Page',
          source: eventData.source || 'homepage'
        });
        break;
        
      case 'lead_form_submitted':
      case 'ai_lead_captured':
        window.fbq('track', 'Lead', {
          content_name: 'EDG Lead Form',
          content_category: 'Lead Generation',
          source: eventData.source || 'web_form',
          value: eventData.projectType || 'unknown'
        });
        break;
        
      case 'click_chat_open':
        window.fbq('track', 'InitiateCheckout', {
          content_name: 'Chat Opened',
          content_category: 'Engagement',
          source: eventData.source || 'unknown'
        });
        break;
        
      case 'book_consult_click':
        window.fbq('track', 'Schedule', {
          content_name: 'Consultation Booking',
          content_category: 'Conversion'
        });
        break;
    }
  }
  
  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, eventData);
  }
};

// Specific event functions for common use cases
export const trackHeroView = (source = 'homepage') => {
  trackEvent('view_hero_cta', { source });
};

export const trackChatOpen = (source = 'unknown') => {
  trackEvent('click_chat_open', { source });
};

export const trackChatStarted = () => {
  trackEvent('ai_chat_started');
};

export const trackLeadCaptured = (leadData = {}) => {
  trackEvent('ai_lead_captured', {
    lead: {
      name: leadData.name,
      company: leadData.company,
      email: leadData.email,
      phone: leadData.phone,
      projectType: leadData.projectType,
      goal: leadData.goal,
      timeline: leadData.timeline,
      isSingaporeRegistered: leadData.isSingaporeRegistered || true,
      source: leadData.source || 'web_ai'
    }
  });
};

export const trackFormViewed = (formType = 'contact') => {
  trackEvent('lead_form_viewed', { formType });
};

export const trackFormSubmitted = (formData = {}) => {
  trackEvent('lead_form_submitted', {
    name: formData.name,
    company: formData.company,
    email: formData.email,
    phone: formData.phone,
    projectType: formData.projectType,
    goal: formData.goal,
    source: formData.source || 'web_form'
  });
};

export const trackBookConsultClick = (source = 'unknown') => {
  trackEvent('book_consult_click', { source });
};

// CRM webhook function (placeholder for future implementation)
export const postLeadToCRM = async (lead) => {
  const webhookUrl = process.env.NEXT_PUBLIC_CRM_WEBHOOK_URL;
  const webhookToken = process.env.NEXT_PUBLIC_CRM_WEBHOOK_TOKEN;
  
  // Skip if CRM webhook not configured
  if (!webhookUrl || webhookUrl === 'https://example-crm-webhook.com/leads') {
    console.log('📝 CRM webhook not configured, skipping CRM sync');
    return false;
  }
  
  const payload = {
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    projectType: lead.projectType,
    goal: lead.goal,
    timeline: lead.timeline,
    isSingaporeRegistered: !!lead.isSingaporeRegistered,
    preferredContact: lead.preferredContact || 'WhatsApp',
    source: lead.source || 'web_ai',
    utm: lead.utm || { source: null, medium: null, campaign: null },
    createdAt: new Date().toISOString()
  };

  const MAX_RETRIES = 3;
  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${webhookToken}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        console.log('✅ Lead synced to CRM successfully');
        return true;
      }
      throw new Error(`CRM webhook failed: ${res.status}`);
    } catch (e) {
      if (i === MAX_RETRIES) {
        console.error('❌ CRM webhook failed after retries:', e);
        return false; // Fall back to existing WhatsApp/email alerts
      }
      await new Promise(r => setTimeout(r, [1000, 3000, 9000][i-1]));
    }
  }
};

// Export default object with all functions
export default {
  initializeTracking,
  trackEvent,
  trackHeroView,
  trackChatOpen,
  trackChatStarted,
  trackLeadCaptured,
  trackFormViewed,
  trackFormSubmitted,
  trackBookConsultClick,
  postLeadToCRM
};