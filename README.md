# HackFrank Core Platform

The HackFrank Core Platform powers all core processes of the HackFrank Hackathon. It manages participants, teams, partner cases, submissions, and jury evaluations in a unified system.

## Overview
The platform supports:
- participant registration and profiles  
- team creation and management  
- case browsing and partner resources  
- project submissions  
- structured jury scoring  
- organizer dashboards and event configuration  

## Technology
- **Frontend:** React + Vite + shadcn/ui + TailwindCSS  
- **Backend:** Node.js (coming soon)  
- **Database:** MongoDB (coming soon)  

## Project Structure

```
hackfrank-core-platform/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # shadcn/ui components (Button, Card, etc.)
│   │   │   └── layout/    # Layout components (Navbar, Layout)
│   │   ├── pages/         # Page components (Dashboard, Teams, Cases, Submissions)
│   │   ├── lib/           # Utilities (cn helper)
│   │   └── index.css      # Global styles + Tailwind + HackFrank theme
│   └── ...
├── backend/           # Node.js backend (placeholder)
├── shared/            # Shared types/schemas (placeholder)
└── README.md
```

## Brand Guidelines

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Cyan (Primary) | `#69EDFF` | Accent, CTAs, highlights |
| Background | `#1B1D22` | Main background |
| Surface | `#23262D` | Cards, inputs |
| White | `#FFFFFF` | Primary text |

### Typography
- **Font:** Poppins (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700, 800, 900

## Development

### Prerequisites
- Node.js 18+
- npm or pnpm

### Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd hackfrank-core-platform

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Pages

- **Dashboard** (`/`) - Overview with stats, featured cases, and CTAs
- **Teams** (`/teams`) - Browse and create teams
- **Cases** (`/cases`) - View partner challenges
- **Submissions** (`/submissions`) - Track project submissions and scores

## License

MIT
