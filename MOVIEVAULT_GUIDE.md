# MovieVault - Production-Grade Cinema Collection Platform

## Overview

MovieVault is a modern, microservices-based web application for managing movie collections, enriched with AI-generated content and user ranking systems. Built with React, TypeScript, and Tailwind CSS, it demonstrates a complete production-ready frontend architecture.

## Architecture

### Microservices Integration

The frontend integrates with four backend services:

1. **Auth Service** - JWT-based authentication and identity management
2. **Film Service** - Movie catalog, search, and metadata
3. **IA Service** - AI-generated editorial content (Gemini, GPT-4, Claude)
4. **Ranking Service** - User scores, leaderboards, and badges

### Design System

- **Dark Theme** - Modern purple/violet color scheme
- **Typography** - Clear hierarchy with consistent spacing
- **Components** - Reusable, composable UI elements
- **Responsive** - Mobile-first design approach

## Features

### 🔐 Authentication Flow

- **Login** - JWT token-based authentication
- **Register** - New user account creation
- **Password Recovery** - Email-based reset flow
- **Session Management** - Persistent client-side storage

Demo Credentials:
- Email: `demo@movievault.com`
- Password: `demo`

### 🏠 Dashboard

- Personalized welcome with user stats
- Featured movie carousel
- Quick stats cards (Level, Movies, Reviews, Rank)
- AI-generated highlights
- Quick action cards

### 🎬 Movie Catalog

- **Search** - Full-text search across movies, directors, genres
- **Filters** - Genre, year, rating filters
- **Sorting** - Popularity, rating, year, title
- **Grid View** - Responsive movie card layout
- **Real-time Results** - Instant search feedback

### 📽️ Movie Detail Page

- **Hero Layout** - Backdrop with overlay
- **Comprehensive Info** - Title, year, duration, rating, synopsis
- **Cast & Crew** - Director and cast members
- **AI Articles** - Generated insights and analysis
- **Collection Actions** - Add/remove from collection

### 📚 User Collection

- **Status Tracking** - Watching, Completed, Plan to Watch, Dropped
- **Edition Management** - Track physical editions
- **Condition Tracking** - Mint, Excellent, Good, Fair
- **Progress Tracking** - Completeness percentage
- **Notes** - Personal annotations
- **Tabs** - Filter by status

### 🤖 AI Content

- **Article Listing** - All AI-generated content
- **Model Attribution** - Shows which AI model (Gemini, GPT-4, Claude)
- **Reading Time** - Estimated read duration
- **Tags** - Categorical organization
- **Rich Content** - Markdown-style formatting

### 📊 Ranking & Leaderboard

- **Global Leaderboard** - Top 20 users
- **User Stats** - Personal score breakdown
- **Level System** - Experience-based progression
- **Badges** - Achievement system with rarity tiers
- **Trend Indicators** - Rank change tracking
- **Point System** - Transparent scoring rules

### ⚙️ Settings

- **Profile Management** - User information display
- **Email Verification** - Account verification status
- **Role Display** - RBAC role indicator
- **Security** - Password and 2FA options (UI ready)
- **Danger Zone** - Account logout and deletion

## Technical Stack

### Core Technologies

- **React 18.3** - Modern React with hooks
- **TypeScript** - Type-safe development
- **React Router 7** - Data mode routing
- **Tailwind CSS 4** - Utility-first styling
- **Vite** - Fast build tooling

### UI Components

- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Motion** - Smooth animations
- **Sonner** - Toast notifications

### State Management

- **Local Storage** - Auth token and user data
- **React State** - Component-level state
- **URL State** - Router-based navigation state

## Project Structure

```
/src/app/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI primitives
│   ├── Navbar.tsx      # Navigation bar
│   ├── MovieCard.tsx   # Movie display card
│   ├── SearchBar.tsx   # Search component
│   ├── RankingCard.tsx # Leaderboard entry
│   ├── UserBadge.tsx   # Achievement badge
│   ├── AIArticleBlock.tsx # AI content display
│   └── CollectionItemCard.tsx # Collection item
├── pages/              # Route pages
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ResetPassword.tsx
│   ├── Home.tsx
│   ├── Catalog.tsx
│   ├── MovieDetail.tsx
│   ├── Collection.tsx
│   ├── AIContent.tsx
│   ├── Ranking.tsx
│   └── Settings.tsx
├── services/           # Backend service integrations
│   ├── auth.service.ts
│   ├── film.service.ts
│   ├── ia.service.ts
│   ├── ranking.service.ts
│   └── collection.service.ts
├── routes.tsx          # Router configuration
└── App.tsx            # Root component

/src/styles/
├── theme.css          # Design tokens
├── tailwind.css       # Tailwind directives
└── fonts.css          # Font imports
```

## Mock Services

All services use mock data with simulated API delays for realistic UX:

### Auth Service
- Mock JWT token generation
- LocalStorage-based session
- Demo user credentials

### Film Service
- 8 mock movies with rich metadata
- Elasticsearch-style search
- Advanced filtering and sorting

### IA Service
- 3 AI-generated articles
- Multiple AI model attribution
- Markdown-style content

### Ranking Service
- 8 user leaderboard
- Badge/achievement system
- Level calculation algorithm

### Collection Service
- CRUD operations
- Status management
- Edition tracking

## Key Design Patterns

### Protected Routes
```tsx
<ProtectedRoute>
  <Home />
</ProtectedRoute>
```

### Service Layer
```tsx
const movies = await filmService.searchMovies({ 
  query: 'inception',
  genre: 'Sci-Fi',
  sortBy: 'rating' 
});
```

### Loading States
```tsx
{loading ? <Loader /> : <Content />}
```

### Error Boundaries
```tsx
try {
  await service.method();
} catch (error) {
  setError(error.message);
}
```

## UX Principles

1. **Fast Feedback** - Loading states on all async operations
2. **Error Handling** - Visible error messages with recovery options
3. **Optimistic UI** - Immediate visual feedback
4. **Progressive Enhancement** - Core functionality works first
5. **Accessibility** - Semantic HTML, ARIA labels, keyboard navigation
6. **Responsive Design** - Mobile-first, tablet, desktop layouts

## Color System

```css
--primary: #8b5cf6        /* Purple/Violet */
--secondary: #27273a      /* Dark Gray */
--background: #0a0a0f     /* Near Black */
--card: #1a1a24          /* Card Background */
--success: #10b981       /* Green */
--warning: #f59e0b       /* Amber */
--destructive: #ef4444   /* Red */
```

## Future Enhancements

### Backend Integration
- Replace mock services with real API calls
- WebSocket for real-time updates
- GraphQL integration for efficient data fetching

### Features
- Movie reviews and ratings
- Social features (following, sharing)
- Recommendation engine
- Advanced search with facets
- Export collection data
- Watchlist sharing

### Performance
- Virtual scrolling for large lists
- Image lazy loading
- Route-based code splitting
- Service worker for offline support

### Analytics
- User behavior tracking
- Performance monitoring
- Error logging
- A/B testing framework

## Development

### Running Locally
The application uses Vite for development and builds.

### Mock Data
All mock data is in the service files and can be easily replaced with API calls.

### Authentication
The demo credentials are hardcoded. In production, implement proper JWT validation and refresh tokens.

## Security Considerations

⚠️ **Production Checklist:**

- [ ] Replace localStorage with httpOnly cookies for tokens
- [ ] Implement CSRF protection
- [ ] Add rate limiting
- [ ] Enable HTTPS only
- [ ] Implement proper JWT validation
- [ ] Add input sanitization
- [ ] Enable CSP headers
- [ ] Implement proper RBAC
- [ ] Add audit logging
- [ ] Enable 2FA

## License

This is a demonstration project showcasing a production-grade frontend architecture.

---

Built with ❤️ for cinema enthusiasts
