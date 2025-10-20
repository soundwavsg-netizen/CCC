# Phase 2 AI Employee - Internal Placeholder (DO NOT DISPLAY YET)

## Moir — Marketing Writer (Template #11)

### Internal Development Notes:
- **Status:** Phase 2 placeholder - hidden from public
- **Launch Target:** Q2 2025 (after Miles proves successful)
- **Split Trigger:** When Miles usage > 80% copy/writing tasks

### Character Specification:
```javascript
// Phase 2 - Internal Only (Feature Flag: ENABLE_MOIR = false)
const moirTemplate = {
  role: 'Marketing Writer',
  name: 'Moir', 
  color: 'robot-moir',
  icon: '✍️',
  tagline: 'Crafts compelling stories that sell.',
  tools: ['Notion', 'Google Docs', 'Grammarly', 'Hemingway'],
  gradientFrom: '#FF6B9D',
  gradientTo: '#C147E9',
  
  // Specialized features (split from Miles)
  expandedFeatures: [
    'Long-form copy and brand voice development',
    'Ad variants and email campaign sequences', 
    'SEO briefs and content optimization',
    'Brand storytelling and thought leadership',
    'Copy testing and conversion optimization'
  ],
  
  // Differentiation from Miles
  focusAreas: {
    miles: 'Campaign planning, social media, analytics',
    moir: 'Long-form writing, brand voice, copy optimization'
  }
}
```

### Implementation Plan:
1. **Feature Flag:** Add ENABLE_MOIR environment variable
2. **Route Protection:** Hide /ai-employees/moir until enabled
3. **Admin Access:** CCC team can preview via /admin/phase2/moir
4. **Split Logic:** When enabled, separate writing tasks from Miles
5. **Migration:** Existing Miles customers get choice to add Moir

### Analytics Events:
```javascript
// Phase 2 tracking (when enabled)
'phase2_employee_preview' // Admin/beta access
'moir_interest_captured' // Early interest from users
'miles_split_conversion' // Users upgrading from Miles to Miles+Moir
```

### Business Logic:
- **Miles:** Focuses on campaign management and social media
- **Moir:** Dedicated long-form writing and brand storytelling
- **Upsell Path:** Miles users → Miles + Moir bundle
- **Pricing:** +$99/month when enabled (premium writing add-on)

---

**DO NOT INCLUDE IN PUBLIC TEMPLATES UNTIL PHASE 2 ACTIVATED**