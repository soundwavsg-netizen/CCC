# CCC Website - User Inputs Snapshot (Oct 2025)

Company: Cognition & Competence Consultancy (CCC)

Design (approved via guidelines):
- Colors: Deep navy (#0B1B2B) + teal (#0FB5AE) on white
- Typography: Chivo (headings), Inter (body)
- Layout: Minimal corporate, rounded elements, subtle shadows, smooth scroll reveals
- Components: Shadcn/UI + Framer Motion

User Requirements:
1) AI Agent Integration: Agents already created in Emergent; need integration method (widget/embed + page routing)
2) Firebase: Project ID ccc-pte-ltd (no web config yet); use backend lead capture first
3) Analytics: GA4 + Meta Pixel placeholders initially
4) Priority: Build full site (7 pages) first, then integrate AI chat routing

Preview URL: https://edubot-hub-1.preview.emergentagent.com

Notes:
- Implement within current stack (React + FastAPI + Mongo) with exportable design for future Next.js/Vercel deployment.
- Contact form: initially via FastAPI /api/contact -> MongoDB (timezone-aware, UUIDs).