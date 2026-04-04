<div align="center">
  <img width="1200" height="475" alt="Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  # VARDHAN VISHNU
  ### Cinematic Visual Portfolio & Editorial Studio Admin
  
  [Live Site](https://Vardhanvishnunef.github.io/Vardhan-Vishnu-nef/) • [Studio Admin](https://Vardhanvishnunef.github.io/Vardhan-Vishnu-nef/#admin)
</div>

---

## 🎞️ About the Portfolio
A high-aesthetic, editorial-driven portfolio built for modern visual artists. This project features a seamless, cinematic browsing experience with a custom-built **Studio Admin Dashboard** that allows for full, self-service content management without touching the code.

### ✨ Key Features
- **Cinematic Story Engine:** Dynamic, localized storytelling for each project with localized data storage.
- **Home Carousel & Stills Grid:** Fully customizable landing page layout.
- **Editorial Info Page:** A clean, minimal breakdown of profile, bio, and technical stack.
- **Studio Admin (v2.0):** A secure, integrated CMS for managing every aspect of the site.
- **Cloud Image Resolution:** Integrated with Supabase Storage for high-performance, globally optimized image delivery.
- **Dual-Platform Deployment:** Optimized for both GitHub Pages and Vercel.

---

## 🛠️ Studio Admin Dashboard
The integrated dashboard (`/#admin`) provides a powerful editorial suite:

- **Stories Management:** Create new stories, toggle carousel visibility, and manage image captions.
- **Home & Stills Editor:** Change titles, subtitles, categories, and descriptions for the main carousel and grid.
- **Profile & Bio Editor:** Update personal details, bio, availability, and contact information.
- **GitHub API Integration:** All changes are committed directly to your repository, triggering automatic deployments.
- **Auth Recovery:** Built-in "Reset Token" functionality to handle session expirations.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **GitHub Personal Access Token** (Classic, with `repo` scope)
- **Supabase Account** (For image storage)

### Local Development
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vardhanvishnunef/Vardhan-Vishnu-nef.git
   cd Vardhan-Vishnu-nef
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file:
   ```env
   VITE_GITHUB_TOKEN=ghp_your_token_here
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_BASE=/ # Set to / for local or Vercel, or /{repo-name}/ for GitHub Pages
   ```

4. **Run the server:**
   ```bash
   npm run dev
   ```

---

## 📦 Deployment

### GitHub Pages (Default)
The site is pre-configured for GitHub Pages. Any push to the `main` branch triggers the `.github/workflows/deploy.yml` workflow.

### Vercel (Professional)
For optimal performance and SPA routing:
1. Connect your repo to **Vercel**.
2. Set Environment Variables:
   - `VITE_BASE=/`
   - `VITE_GITHUB_TOKEN=your_token`
3. Vercel will automatically use the provided `vercel.json` for routing.

---

## 🎨 Tech Stack
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS + Vanilla CSS
- **Animations:** Framer Motion
- **CMS Logic:** Custom GitHub API Wrapper
- **Storage:** Supabase Storage (Bucket: `portfolio-images`)

---

<div align="center">
  <p>© 2024 Vardhan Vishnu • Visual Artist</p>
</div>
