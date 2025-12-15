# Frontend – Sports Reconnect Certificate Generator

Modern React + Vite frontend for dynamic certificate generation with authentication and template selection.

## Quick Start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # Production build
npm run preview   # Preview prod build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx
│   ├── TemplateCard.tsx
│   └── ...
├── pages/               # Full-page components
│   ├── AuthPage.tsx     # Login/Sign-up
│   └── LandingPage.tsx  # Template selection
├── data/                # Static/dummy data
│   └── templates.ts
├── types.ts             # TypeScript interfaces
├── App.tsx              # Routes & main app
├── main.tsx             # Entry point
└── index.css            # Global Tailwind styles
```

## Features

✅ Dark theme with glassmorphism  
✅ Login/Sign-up toggle  
✅ Responsive template grid (3-col on desktop, 1-2 col on mobile)  
✅ Hover effects (scale, glow, overlay)  
✅ React Router SPA navigation  
✅ Brand color palette (#005461, #018790, #00B7B5, #F4F4F4)  
✅ Tailwind CSS only (no custom CSS)  

## Configuration

### Tailwind Theme
Edit `tailwind.config.cjs` to customize colors, fonts, or breakpoints. Brand palette is pre-configured.

### Environment Variables
Create `.env`:
```
VITE_API_URL=http://localhost:3001
```

Reference in code:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

## Development

- **Add Pages**: Create new files in `src/pages/`, add routes to `App.tsx`
- **Add Components**: Create in `src/components/`, import as needed
- **Style**: Use Tailwind classes; extend theme in `tailwind.config.cjs` if needed
- **Types**: Define interfaces in `src/types.ts`

## Building & Deployment

```bash
npm run build     # Outputs to dist/
npm run preview   # Test production build locally
```

Deploy `dist/` folder to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist/`
- **AWS S3**: `aws s3 sync dist/ s3://your-bucket/`

---

**Status**: ✅ Scaffolding complete  
**Next**: Connect to backend API when ready
