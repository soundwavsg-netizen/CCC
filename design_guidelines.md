{
  "project": {
    "name": "Cognition & Competence Consultancy (CCC)",
    "tagline": "Singapore-based digital transformation for SMEs",
    "audience": "Singapore SMEs seeking modernisation via tech (owners, operations, marketing, finance)",
    "brand_attributes": ["trustworthy", "credible", "professional", "modern", "technology-focused"],
    "style": "Minimal, corporate, high-clarity UI with deep navy base, teal accents, white surfaces, rounded elements, smooth scroll reveals",
    "site_structure": [
      "Home",
      "About Us",
      "Services",
      "Portfolio",
      "Grants & Funding",
      "Contact",
      "Legal/PDPA/Terms"
    ]
  },

  "inspiration": {
    "notes": "Minimal corporate agency layouts with split-hero, crisp service cards, light bento grids, and unobtrusive motion.",
    "references": [
      {
        "source": "Dribbble",
        "description": "Digital Transformation Agency – minimal palette, service-first layout"
      },
      {
        "source": "Behance",
        "description": "Digital services websites featuring navy/teal consultancy palettes and clear case studies"
      },
      {
        "source": "Awwwards",
        "description": "Business & Corporate category – clean hero, strong CTAs, subtle motion"
      }
    ]
  },

  "color_system": {
    "tokens_hex": {
      "brand-navy": "#0B1B2B",
      "brand-navy-600": "#11283D",
      "brand-navy-500": "#173552",
      "brand-teal": "#0FB5AE",
      "brand-teal-600": "#0AA099",
      "brand-teal-100": "#EAF7F5",
      "ink-900": "#0A0F1A",
      "ink-700": "#1F2A37",
      "ink-500": "#475467",
      "ink-300": "#98A2B3",
      "neutral-50": "#F8FAFC",
      "neutral-100": "#F2F4F7",
      "neutral-200": "#EAECF0",
      "neutral-300": "#D0D5DD",
      "success": "#12B76A",
      "warning": "#F79009",
      "danger": "#D92D20",
      "link": "#0B84F3"
    },
    "css_custom_properties_for_index.css": "@layer base { :root { --background: 0 0% 100%; --foreground: 216 45% 6%; --card: 0 0% 100%; --card-foreground: 216 45% 6%; --popover: 0 0% 100%; --popover-foreground: 216 45% 6%; --primary: 210 60% 12%; --primary-foreground: 180 70% 97%; --secondary: 180 84% 38%; --secondary-foreground: 180 100% 98%; --muted: 210 18% 96%; --muted-foreground: 215 20% 52%; --accent: 180 84% 94%; --accent-foreground: 210 60% 12%; --destructive: 3 75% 49%; --destructive-foreground: 0 0% 98%; --border: 210 20% 88%; --input: 210 20% 88%; --ring: 180 84% 38%; --radius: 0.625rem; /* 10px */ } .dark { --background: 216 45% 6%; --foreground: 0 0% 98%; --card: 218 35% 9%; --card-foreground: 0 0% 98%; --popover: 218 35% 9%; --popover-foreground: 0 0% 98%; --primary: 0 0% 98%; --primary-foreground: 216 45% 6%; --secondary: 180 20% 24%; --secondary-foreground: 0 0% 98%; --muted: 218 16% 16%; --muted-foreground: 214 20% 80%; --accent: 180 18% 18%; --accent-foreground: 0 0% 98%; --destructive: 3 65% 40%; --destructive-foreground: 0 0% 98%; --border: 218 16% 18%; --input: 218 16% 18%; --ring: 180 70% 45%; --radius: 0.625rem; } }",
    "usage": {
      "background": "white surfaces on content areas. Use brand-navy as section headers/hero backdrop or stripes only.",
      "primary_actions": "Teal (brand-teal) buttons on white; switch to navy buttons on tinted backgrounds.",
      "links": "link blue for anchors; on hover, underline and change to brand-teal-600.",
      "borders": "neutral-200/300. Avoid heavy borders; prefer soft shadows.",
      "charts": ["secondary/teal", "ink-500", "brand-navy-500", "success"]
    },
    "gradients": {
      "allowed_examples": [
        "linear-gradient(135deg, #EAF7F5 0%, #FFFFFF 40%, #EAF7F5 100%)",
        "linear-gradient(180deg, rgba(11,27,43,0.06) 0%, rgba(255,255,255,0) 60%)"
      ],
      "rules": [
        "Never exceed 20% of viewport area",
        "Never apply to text-heavy content blocks",
        "No saturated purple/pink/blue stacks; keep it light and desaturated",
        "Use only for hero/section backgrounds and decorative stripes"
      ]
    }
  },

  
  "typography": {
    "fonts": {
      "heading": "Chivo",
      "body": "Inter"
    },
    "import": {
      "google_fonts_link": "https://fonts.googleapis.com/css2?family=Chivo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      "tailwind_base": "@layer base { * { font-feature-settings: 'ss01' on, 'cv05' on; } h1,h2,h3,h4 { font-family: 'Chivo', system-ui, sans-serif; } body { font-family: 'Inter', system-ui, sans-serif; } }"
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl tracking-tight",
      "h2": "text-base md:text-lg font-semibold text-ink-700",
      "h3": "text-xl md:text-2xl font-semibold",
      "body": "text-base md:text-base text-ink-700",
      "small": "text-sm text-ink-500"
    },
    "line_height": {
      "h1": 1.1,
      "h2_h3": 1.25,
      "body": 1.65
    }
  },

  "spacing_radius_shadows": {
    "spacing_scale_px": [4, 8, 12, 16, 24, 32, 40, 48, 64, 80],
    "container_widths": {
      "xs": "max-w-screen-sm",
      "md": "max-w-screen-md",
      "lg": "max-w-screen-lg",
      "xl": "max-w-screen-xl"
    },
    "radius_tokens": {
      "--radius-xs": "4px",
      "--radius-sm": "6px",
      "--radius-md": "10px",
      "--radius-lg": "14px",
      "--radius-xl": "20px"
    },
    "shadows": {
      "card": "shadow-[0_6px_24px_rgba(16,24,40,0.06)]",
      "elevated": "shadow-[0_12px_40px_rgba(16,24,40,0.10)]",
      "focus": "ring-2 ring-[--ring] ring-offset-2 ring-offset-white"
    }
  },

  "layout_patterns": {
    "header": "Sticky top-0 bg-white/95 backdrop-blur supports [max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8] h-16 flex items-center border-b",
    "hero": "Split-screen layout (text left, visual right) on lg+; stacked on mobile. White text on navy only when navy used as section bg.",
    "grid": {
      "cards": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8",
      "bento": "grid grid-cols-1 md:grid-cols-6 gap-6 [use col-span-* for emphasis]",
      "content": "prose max-w-none space-y-6"
    },
    "sections": "py-16 sm:py-20 lg:py-28",
    "footer": "bg-[hsl(var(--background))] border-t text-ink-500"
  },

  "buttons": {
    "tone": "Professional / Corporate",
    "tokens": {
      "--btn-radius": "10px",
      "--btn-shadow": "0 6px 18px rgba(15,181,174,0.22)",
      "--btn-motion": "transition-colors duration-200 ease-out"
    },
    "variants": [
      {
        "name": "primary",
        "usage": "Main CTAs",
        "classes": "inline-flex items-center justify-center rounded-[10px] bg-[hsl(var(--secondary))] text-white px-5 py-3 font-medium hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] data-[state=open]:bg-teal-600"
      },
      {
        "name": "secondary",
        "usage": "Secondary actions",
        "classes": "inline-flex items-center justify-center rounded-[10px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-5 py-3 font-medium hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
      },
      {
        "name": "ghost",
        "usage": "Low emphasis / text button",
        "classes": "inline-flex items-center justify-center rounded-[10px] px-5 py-3 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
      }
    ],
    "sizes": {
      "sm": "h-9 px-3 text-sm",
      "md": "h-11 px-5 text-base",
      "lg": "h-12 px-6 text-base"
    }
  },

  "components": {
    "paths": {
      "button": "./components/ui/button.jsx",
      "card": "./components/ui/card.jsx",
      "accordion": "./components/ui/accordion.jsx",
      "tabs": "./components/ui/tabs.jsx",
      "badge": "./components/ui/badge.jsx",
      "navigationMenu": "./components/ui/navigation-menu.jsx",
      "sheet": "./components/ui/sheet.jsx",
      "dialog": "./components/ui/dialog.jsx",
      "carousel": "./components/ui/carousel.jsx",
      "form": "./components/ui/form.jsx",
      "input": "./components/ui/input.jsx",
      "textarea": "./components/ui/textarea.jsx",
      "select": "./components/ui/select.jsx",
      "checkbox": "./components/ui/checkbox.jsx",
      "toast_sonner": "./components/ui/sonner.jsx",
      "table": "./components/ui/table.jsx",
      "calendar": "./components/ui/calendar.jsx",
      "breadcrumb": "./components/ui/breadcrumb.jsx"
    },
    "usage_guidelines": [
      "Always import from ./components/ui/*.jsx; avoid raw HTML components for dropdowns, calendars, toasts, dialogs.",
      "All interactive elements MUST include data-testid attributes using kebab-case describing role (e.g., data-testid=\"primary-cta-button\").",
      "Buttons use the variants above; ensure visible focus state and WCAG AA contrast."
    ],
    "micro_interactions": [
      "Header links: underline expand on hover using before pseudo-element (scale-x reveal)",
      "Cards: subtle lift (translate-y-[-2px], shadow intensify) on hover",
      "Buttons: fill shade shift + focus ring; disabled reduces opacity and removes hover",
      "Section reveal: fade-up 8–16px using Framer Motion on scroll"
    ]
  },

  "pages": {
    "Home": {
      "layout": [
        "Hero: split-screen (copy left with CTA; skyline image right)",
        "Services overview: 4 feature cards in grid",
        "Highlighted grants: EDG/SFEC badges + link to Grants page",
        "Recent work carousel: 3–6 items",
        "CTA banner"
      ],
      "hero_example_jsx": "import { Button } from './components/ui/button'; import { Card } from './components/ui/card'; import { motion } from 'framer-motion'; export default function Hero() { return (<section className=\"relative overflow-hidden bg-white\"> <div className=\"max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center\"> <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5}}> <h1 className=\"text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))]\">Digital transformation for Singapore SMEs</h1> <p className=\"mt-6 text-base text-ink-700 max-w-prose\">CCC delivers AI implementation, modern websites/apps, e-commerce, and grants support (EDG/SFEC).</p> <div className=\"mt-8 flex flex-wrap gap-3\"> <Button data-testid=\"primary-cta-button\" className=\"\">Book a consultation</Button> <Button data-testid=\"secondary-cta-button\" variant=\"ghost\">View portfolio</Button> </div> </motion.div> <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6, delay:0.1}}> <Card className=\"rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(16,24,40,0.08)]\"> <img alt=\"Singapore skyline\" src=\"REPLACE_WITH_image_urls.hero.primary\" className=\"w-full h-[360px] object-cover\" data-testid=\"hero-image\" /> </Card> </motion.div> </div> </section> ); }"
    },
    "About Us": {
      "layout": [
        "Intro + mission/vision two-column",
        "Leadership/value props",
        "Timeline or stats",
        "Call-to-action"
      ],
      "components": ["Card", "Tabs", "Badge", "Accordion"]
    },
    "Services": {
      "layout": [
        "Service filter tabs (Web/App, AI Automation, E-Commerce, Training & Grants)",
        "Cards with feature bullets and mini case links",
        "CTA strip"
      ],
      "service_card_jsx": "import { Card } from './components/ui/card'; import { Button } from './components/ui/button'; export function ServiceCard({ icon:Icon, title, desc }) { return (<Card className=\"p-6 rounded-xl hover:shadow-[0_12px_40px_rgba(16,24,40,0.08)] transition-[box-shadow] duration-200\" data-testid=\"service-card\"> <div className=\"flex items-start gap-4\"> <div className=\"h-10 w-10 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center text-[hsl(var(--primary))]\" aria-hidden> {Icon ? <Icon size={20} /> : null} </div> <div className=\"flex-1\"> <h3 className=\"text-xl font-semibold\">{title}</h3> <p className=\"mt-2 text-ink-700\">{desc}</p> <Button data-testid=\"service-learn-more-button\" className=\"mt-4\">Learn more</Button> </div> </div> </Card>); }"
    },
    "Portfolio": {
      "layout": [
        "Filterable grid of projects",
        "Case study dialog per item",
        "Carousel for screenshots"
      ],
      "project_item_jsx": "import { Dialog, DialogContent, DialogTrigger } from './components/ui/dialog'; import { Card } from './components/ui/card'; export function ProjectItem({ cover, title, summary }){ return (<Dialog> <DialogTrigger asChild> <Card className=\"group overflow-hidden rounded-xl cursor-pointer\" data-testid=\"portfolio-item\"> <img src={cover} alt={title} className=\"w-full h-56 object-cover group-hover:scale-[1.02] transition-transform duration-300\" /> <div className=\"p-4\"> <h3 className=\"font-semibold\">{title}</h3> <p className=\"text-sm text-ink-500\">{summary}</p> </div> </Card> </DialogTrigger> <DialogContent className=\"max-w-3xl\"> <img src={cover} alt={title} className=\"w-full h-auto rounded-lg\" /> </DialogContent> </Dialog> ); }"
    },
    "Grants & Funding": {
      "layout": [
        "Intro to EDG & SFEC with eligibility badges",
        "Accordion for FAQs",
        "Comparison table for schemes",
        "CTA to contact"
      ],
      "components": ["Accordion", "Table", "Badge"],
      "faq_item_jsx": "import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/ui/accordion'; export function GrantsFAQ(){ return (<Accordion type=\"single\" collapsible className=\"w-full\" data-testid=\"grants-faq\"> <AccordionItem value=\"item-1\"> <AccordionTrigger>What is EDG?</AccordionTrigger> <AccordionContent>Enterprise Development Grant info…</AccordionContent> </AccordionItem> </Accordion>); }"
    },
    "Contact": {
      "layout": [
        "Contact form",
        "Map (embed) and details",
        "Thank-you toast"
      ],
      "contact_form_jsx": "import { useState } from 'react'; import { Input } from './components/ui/input'; import { Textarea } from './components/ui/textarea'; import { Button } from './components/ui/button'; import { toast } from './components/ui/sonner'; export default function ContactForm(){ const [loading,setLoading]=useState(false); const submit=async(e)=>{ e.preventDefault(); setLoading(true); try{ /* submit to FastAPI */ toast.success('Thanks! We\'ll get back shortly.'); }finally{ setLoading(false);} }; return (<form onSubmit={submit} className=\"space-y-4 max-w-xl\" data-testid=\"contact-form\"> <Input placeholder=\"Full name\" required data-testid=\"contact-name-input\"/> <Input type=\"email\" placeholder=\"Email\" required data-testid=\"contact-email-input\"/> <Input placeholder=\"Company\" data-testid=\"contact-company-input\"/> <Textarea rows=\"5\" placeholder=\"How can we help?\" required data-testid=\"contact-message-textarea\"/> <Button data-testid=\"contact-form-submit-button\" disabled={loading}>{loading ? 'Sending…' : 'Send message'}</Button> </form> ); }",
      "map_embed_html": "<div class=\"rounded-xl overflow-hidden border\"><iframe title=\"CCC Location\" data-testid=\"contact-map-iframe\" src=\"https://maps.google.com/maps?q=singapore&t=&z=13&ie=UTF8&iwloc=&output=embed\" width=\"100%\" height=\"320\" style=\"border:0\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe></div>"
    },
    "Legal": {
      "layout": ["Simple content pages: PDPA, Terms. Left-aligned, wide reading measure (~68ch)."],
      "components": ["Breadcrumb", "Separator"]
    }
  },

  "data_testid_convention": {
    "rule": "kebab-case describing role and action, stable over style changes",
    "examples": [
      "primary-cta-button",
      "main-nav-services-link",
      "service-card",
      "portfolio-item",
      "grants-faq",
      "contact-form-submit-button",
      "error-alert-text",
      "user-balance-text"
    ]
  },

  "accessibility": {
    "contrast": "All text/backgrounds must meet WCAG AA. Navy on white, teal on white, and white on navy verified.",
    "focus": "Visible focus indicators using --ring and ring-offset",
    "motion": "Respect prefers-reduced-motion: disable entrance animations and parallax",
    "aria": "Provide aria-labels for icons; ensure semantic headings and landmarks"
  },

  "motion": {
    "library": "Framer Motion",
    "install": "npm i framer-motion",
    "principles": ["Entrance: fade+up 8–16px, 250–450ms", "Hover: 1–2% scale or shade only", "No universal transition: all"],
    "scroll_reveal_util_js": "// use inside components\nimport { motion } from 'framer-motion';\nexport const FadeUp = ({delay=0, children}) => (<motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true, amount:0.2}} transition={{duration:0.45, delay}}>{children}</motion.div>);"
  },

  "libraries_optional": {
    "icons": {
      "recommendation": "lucide-react (already common with shadcn) or FontAwesome CDN",
      "install": "npm i lucide-react"
    },
    "charts": {
      "option": "Recharts for simple KPIs on case studies",
      "install": "npm i recharts"
    },
    "map": {
      "default": "Google Maps iframe (lightweight)",
      "advanced_option": "react-leaflet + leaflet",
      "install": "npm i react-leaflet leaflet"
    },
    "lottie": {
      "option": "For a subtle tech animation in hero if desired",
      "install": "npm i lottie-react"
    }
  },

  "backend_integration": {
    "tech": "FastAPI + MongoDB",
    "notes": [
      "Use POST /api/contact to submit contact form. Return 200/201 with success message.",
      "Sanitize inputs server-side and store leads in MongoDB (leads collection).",
      "Return validation errors with clear messages; display using Shadcn Alert and data-testid=\"error-alert-text\"."
    ]
  },

  "page_specific_content_patterns": {
    "services_list": [
      {"title": "Website & App Development", "bullets": ["Responsive React frontends", "FastAPI backends", "Performance-first"]},
      {"title": "AI Automation", "bullets": ["Workflow automation", "Chatbots & RAG", "Ops augmentation"]},
      {"title": "E-Commerce", "bullets": ["Product catalogs", "Payments", "Analytics"]},
      {"title": "Business Training & Grants", "bullets": ["Team upskilling", "EDG/SFEC guidance", "Documentation support"]}
    ],
    "portfolio_filters": ["All", "Web & App", "AI", "E-Commerce", "Training/Grants"]
  },

  "image_urls": [
    {
      "category": "hero",
      "description": "Singapore Marina Bay skyline at night (navy/teal lights)",
      "url": "https://images.unsplash.com/photo-1577548696089-f7bcbc22f70e?auto=format&fit=crop&q=85"
    },
    {
      "category": "hero_alt",
      "description": "Gardens by the Bay Supertrees with blue lighting",
      "url": "https://images.unsplash.com/photo-1746430132022-9a9d5f84ebec?auto=format&fit=crop&q=85"
    },
    {
      "category": "portfolio_cover",
      "description": "Singapore skyline panorama for project cover",
      "url": "https://images.unsplash.com/photo-1537155986727-3c402583a35a?auto=format&fit=crop&q=85"
    },
    {
      "category": "section_bg",
      "description": "City at night with reflections (muted)",
      "url": "https://images.unsplash.com/photo-1551395722-0ac9e89cee11?auto=format&fit=crop&q=85"
    },
    {
      "category": "bento_visual",
      "description": "Teal-toned modern architecture (Pexels)",
      "url": "https://images.pexels.com/photos/14321795/pexels-photo-14321795.jpeg"
    },
    {
      "category": "bento_visual_alt",
      "description": "Minimal dusk city detail (Pexels)",
      "url": "https://images.pexels.com/photos/18091875/pexels-photo-18091875.jpeg"
    }
  ],

  "grid_and_responsiveness": {
    "mobile_first": true,
    "container": "mx-auto px-4 sm:px-6 lg:px-8",
    "breakpoints": {
      "sm": 640,
      "md": 768,
      "lg": 1024,
      "xl": 1280
    },
    "patterns": [
      "Single column on mobile; upgrade to two and three columns progressively",
      "Avoid centering the entire app container (no .App { text-align:center })",
      "Use extra whitespace (2–3x) around sections and between groups"
    ]
  },

  "testing_and_qc": {
    "sonner_toasts_path": "./components/ui/sonner.jsx",
    "rules": [
      "Every interactive element and key info element MUST have a data-testid",
      "Use Playwright/RTL friendly ids; keep stable despite DOM changes",
      "Add empty/loading/error states to lists and forms"
    ],
    "examples": {
      "button": "<Button data-testid=\"home-hero-cta-button\">Start now</Button>",
      "error_text": "<p role=\"alert\" data-testid=\"error-alert-text\">Something went wrong</p>",
      "menu": "<button data-testid=\"mobile-menu-toggle-button\" aria-expanded=\"false\"/>"
    }
  },

  "instructions_to_main_agent": [
    "Add Google Fonts link to index.html and paste typography tailwind base into index.css @layer base block.",
    "Replace current :root tokens in index.css with the provided color tokens (keep dark mode section).",
    "Build pages using Shadcn components at ./components/ui/*.jsx only; avoid raw HTML for complex components (dropdowns, dialogs, calendars, toasts).",
    "Implement Framer Motion reveal wrappers for sections; honor prefers-reduced-motion.",
    "Use gradient backgrounds only in hero/section wrappers per gradient rules; keep content areas solid white.",
    "Embed map via provided iframe initially; consider react-leaflet later if needed.",
    "Ensure all CTAs and inputs include data-testid attributes (kebab-case).",
    "Use Sonner toasts from ./components/ui/sonner.jsx for confirmations.",
    "All components use named exports (export const ComponentName = ...) and pages default exports (export default function PageName(){...})",
    "Do not use universal transition: all; scope transitions to colors/opacity/box-shadow only."
  ],

  "component_path": {
    "header_nav": ["./components/ui/navigation-menu.jsx", "./components/ui/sheet.jsx", "./components/ui/button.jsx"],
    "cards": ["./components/ui/card.jsx", "./components/ui/badge.jsx"],
    "overlays": ["./components/ui/dialog.jsx", "./components/ui/drawer.jsx", "./components/ui/tooltip.jsx"],
    "forms": ["./components/ui/form.jsx", "./components/ui/input.jsx", "./components/ui/textarea.jsx", "./components/ui/select.jsx", "./components/ui/checkbox.jsx"],
    "data_display": ["./components/ui/table.jsx", "./components/ui/accordion.jsx", "./components/ui/tabs.jsx", "./components/ui/breadcrumb.jsx", "./components/ui/separator.jsx"],
    "feedback": ["./components/ui/sonner.jsx", "./components/ui/alert.jsx", "./components/ui/progress.jsx"]
  },

  "do_and_dont": {
    "do": [
      "Use white content backgrounds with navy/teal accents",
      "Prefer card elevation over borders",
      "Use rounded 10px corners across surfaces",
      "Provide micro-animations for hover/focus/scroll"
    ],
    "dont": [
      "No purple/pink gradients",
      "No gradients on small UI elements",
      "Do not center-align entire app container",
      "Do not use transition: all"
    ]
  },

  "legal_pages": {
    "pdpa": "State data collection, usage, consent, access, retention, contact.",
    "terms": "Services scope, IP, liability, payment, confidentiality, governing law (Singapore).",
    "footer_links_order": ["PDPA", "Terms", "Contact"]
  },

  "general_ui_ux_design_guidelines": "- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
}
