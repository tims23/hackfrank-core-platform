# HackFrank Core Platform

The HackFrank Core Platform powers all core processes of the HackFrank Hackathon. It manages participants, teams, partner cases, submissions, and jury evaluations in a unified system.

<img width="1257" height="799" alt="image" src="https://github.com/user-attachments/assets/7d8bc50c-4d4a-4ae4-9546-e9ac85461a65" />

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
- **Backend:** Node.js (Vercel serverless functions)  
- **Database:** Firebase Firestore  

## Project Structure

```
hackfrank-core-platform-luis/
├── api/               # Vercel serverless API handlers
│   ├── applicants.ts
│   ├── participants.ts
│   ├── teams.ts
│   └── lib/           # Auth middleware + Firebase Admin helpers
├── src/               # Main React app source
│   ├── components/    # UI, auth guards, layout, team components
│   ├── contexts/      # React context providers
│   ├── lib/           # Client helpers (firebase, api, data)
│   ├── pages/         # Route pages
│   ├── assets/
│   └── main.tsx
├── scripts/           # Build and utility scripts
├── public/            # Static files
├── index.html
├── vite.config.ts
├── package.json
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
cd hackfrank-core-platform-luis

# Install dependencies
npm install

# Set up environment variables (create .env.local with Firebase config)
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
npm run dump:firestore # Export Firestore collections to JSON
```

## Pages

- **Dashboard** (`/`) - Overview with stats, featured cases, and CTAs
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration
- **Profile** (`/profile`) - User profile management
- **Participants** (`/participants`) - Browse event participants
- **Teams** (`/teams`) - Browse and create teams
- **Cases** (`/cases`) - View partner challenges
- **ApplicationForm** (`/apply`) - Multi-step project submission

## License

MIT
