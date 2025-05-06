# Podcast Web App

A modern, full-stack podcast tracking and review platform. Built with Next.js (TypeScript, Tailwind CSS) and Flask (Python, SQLite), this project aims to deliver a seamless, social, and data-rich podcast experience.

---

## 🚀 Capabilities

- Browse & Search Podcasts: Discover shows and episodes, filter and search with advanced options.
- Track Listening: Mark episodes as listened, view your listening history, and analyze trends.
- Review & Rate: Write rich reviews, rate episodes, and interact with community content.
- User Profiles: Manage your profile, favorite podcasts, and social connections.
- Social Features: Like, comment, follow, and share—building a community around podcast listening.
- Personalized Recommendations: Get suggestions based on your interests and listening habits.
- Analytics & Insights: Visualize your listening stats, genre preferences, and year-in-review.
- Mobile-First UI: Responsive design with mobile navigation, dark mode, and smooth interactions.
- API-first Architecture: RESTful endpoints for all major operations, ready for integration and extension.

---

## 🛠️ Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS, Supabase Auth
- Backend: Flask 3, SQLite, Spotipy (Spotify API integration)
- API: RESTful, CORS-enabled, documented endpoints
- Dev Tools: pnpm, concurrently, dotenv, ESLint

---

## 📈 Project Status

**In Progress:**  
This project is under active development.  
- Core podcast browsing, listening history, and review features are implemented.
- User authentication, profile management, and social features are in progress.
- Many advanced features (analytics, recommendations, notifications, lists, etc.) are planned and tracked in the [PRD](./PRD.md).

**What works now:**  
- Browse/search shows and episodes
- Add and view reviews
- Track listening history
- Basic user authentication (Supabase)
- Responsive UI

**Actively developing:**  
- Social login, onboarding, and profile enhancements
- Comments, likes, and notifications
- Analytics dashboards and export tools

See [PRD.md](./PRD.md) for the full roadmap and feature breakdown.

---

## 🏗️ Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- pnpm (or npm/yarn)
- SQLite (bundled)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/podcast-web-app.git
cd podcast-web-app

# Install backend dependencies
cd api
pip install -r requirements.txt
cd ..

# Install frontend dependencies
pnpm install
```

### Running Locally

```bash
# Start Flask backend (port 5328)
pnpm run flask-dev

# In a new terminal, start Next.js frontend (port 3000)
pnpm run next-dev
```

Or run both together:
```bash
pnpm run dev
```

- Frontend: http://localhost:3000  
- Backend API: http://localhost:5328/api

---

## 🧩 Project Structure

```
flasknext/
├── app/         # Next.js frontend (TypeScript, Tailwind)
├── api/         # Flask backend (Python, SQLite)
├── public/      # Static assets
├── supabase/    # Auth and storage config
├── PRD.md       # Product requirements & roadmap
├── README.md
```

---

## 🌟 Why This Project?

- Showcases full-stack skills: Modern React/Next.js, Python API, database design, and cloud auth.
- Demonstrates product thinking: PRD-driven, feature-rich, and user-focused.
- Open for collaboration: Clean, modular codebase and clear roadmap.

---

## 📋 Roadmap

See [PRD.md](./PRD.md) for a detailed, always-updated list of features, bugs, and future plans.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!  
Please open an issue or pull request.

---

## 📄 License

MIT

---

**Current Status:**  
This project is a work in progress and not yet production-ready.  
Follow along or contribute to help shape the future of podcast listening!