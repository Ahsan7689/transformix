<div align="center">

```
████████╗██████╗  █████╗ ███╗   ██╗███████╗███████╗ ██████╗ ██████╗ ███╗   ███╗██╗██╗  ██╗
╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝██╔════╝██╔═══██╗██╔══██╗████╗ ████║██║╚██╗██╔╝
   ██║   ██████╔╝███████║██╔██╗ ██║███████╗█████╗  ██║   ██║██████╔╝██╔████╔██║██║ ╚███╔╝ 
   ██║   ██╔══██╗██╔══██║██║╚██╗██║╚════██║██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║██║ ██╔██╗ 
   ██║   ██║  ██║██║  ██║██║ ╚████║███████║██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║██║██╔╝ ██╗
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═╝
```

### ✦ Your All-in-One AI-Powered File & Link Toolbox ✦

<br/>

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-F8E3A3?style=for-the-badge)](./LICENSE)
[![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-F89B9B?style=for-the-badge)](#)

<br/>

> **Transformix** is a sleek, dark-mode-first SaaS toolkit that lets anyone convert files, generate AI images, shorten links, strip metadata and more — all in one beautiful interface. No subscriptions. No bloat. Just tools.

<br/>

[🚀 Live Demo](#) · [📖 Setup Guide](#-getting-started) · [🐛 Report Bug](../../issues) · [💡 Request Feature](../../issues)

---

</div>

<br/>

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔄 File Converter
Convert between **50+ formats** instantly in your browser. Video, audio, images, documents — powered by FFmpeg WASM with zero server uploads.

</td>
<td width="50%">

### 📄 Image → PDF
Drag and drop multiple images, reorder them, and export a perfectly formatted PDF — all client-side, lightning fast.

</td>
</tr>
<tr>
<td width="50%">

### 🔗 Link Shortener
Generate short, shareable links stored in Supabase with real-time click tracking and instant redirects.

</td>
<td width="50%">

### 🛡️ Metadata Remover
Strip hidden EXIF data from photos before sharing. Location, device info, timestamps — all scrubbed privately in-browser.

</td>
</tr>
<tr>
<td width="50%">

### 🎨 AI Image Generator
Describe anything. Get stunning AI-generated images instantly via **Pollinations AI (Flux model)** — 100% free, no API key, no quota ever.

</td>
<td width="50%">

### 🪙 Credit System
25 free credits for guests · 100 credits on sign-up · Auto-refill every 28h (guest) or 24h (user). Persisted per-user with no resets on refresh.

</td>
</tr>
</table>

<br/>

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:---|:---|
| ⚡ **Framework** | React 18 + Vite 5 |
| 🎨 **Styling** | Tailwind CSS 3 + Custom CSS Variables |
| 🌀 **Animation** | Motion (Framer Motion) + GSAP + Lenis Smooth Scroll |
| 🗄️ **Backend** | Supabase (Auth + PostgreSQL) |
| 🤖 **AI Images** | Pollinations.ai — Flux model (free, unlimited) |
| 🎬 **File Processing** | FFmpeg WASM (runs 100% in browser, no server) |
| 📦 **PDF Export** | jsPDF |
| 🔔 **Notifications** | react-hot-toast |
| 🚦 **Routing** | React Router v6 |

</div>

<br/>

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org)
- A **[Supabase](https://supabase.com)** project (free tier works perfectly)

### 1 · Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/transformix.git
cd transformix
npm install
```

### 2 · Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> 🔑 Find these in your Supabase project under **Settings → API**

### 3 · Database Setup

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Credits table
create table credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  ip_address text,
  credits integer not null default 25,
  last_reset timestamptz not null default now(),
  created_at timestamptz default now()
);

-- Short links table
create table short_links (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  original_url text not null,
  clicks integer default 0,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table credits enable row level security;
alter table short_links enable row level security;

-- Policies
create policy "Users manage own credits" on credits
  for all using (auth.uid() = user_id or user_id is null);

create policy "Anyone can read short links" on short_links
  for select using (true);

create policy "Anyone can create short links" on short_links
  for insert with check (true);

create policy "Anyone can update clicks" on short_links
  for update using (true);
```

### 4 · Run Locally

```bash
npm run dev
# Open → http://localhost:5173
```

<br/>

## 📁 Project Structure

```
transformix/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         # Navigation + credit badge
│   │   ├── Footer.jsx         # Site footer
│   │   ├── CreditGuard.jsx    # Blocks tools at 0 credits
│   │   ├── AuthModal.jsx      # Sign in / Sign up modal
│   │   └── ...
│   ├── context/
│   │   ├── CreditContext.jsx  # Per-user credit system
│   │   ├── AuthContext.jsx    # Supabase auth state
│   │   └── ThemeContext.jsx   # Dark / light mode toggle
│   ├── pages/
│   │   ├── Home.jsx               # Landing page
│   │   ├── AIImageGenerator.jsx   # AI images (Pollinations/Flux)
│   │   ├── FileConverter.jsx      # FFmpeg WASM converter
│   │   ├── ImageToPDF.jsx         # Image → PDF tool
│   │   ├── LinkShortener.jsx      # URL shortener
│   │   ├── MetadataRemover.jsx    # EXIF metadata remover
│   │   ├── About.jsx              # About / team page
│   │   └── Profile.jsx            # User profile
│   ├── hooks/
│   │   └── useLenis.js        # Smooth scroll integration
│   ├── lib/
│   │   └── supabase.js        # Supabase client init
│   ├── App.jsx                # Router + context providers
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles + design tokens
├── .env                       # 🚫 Git-ignored — your secrets
├── .gitignore
├── vite.config.js             # Vite + proxy config
├── tailwind.config.js
└── package.json
```

<br/>

## 🪙 Credit System

| User Type | Starting Credits | Refill Amount | Refill Every |
|:---:|:---:|:---:|:---:|
| 👤 Guest | **25** | +10 | 28 hours |
| ✅ Signed In | **100** | +50 | 24 hours |

Credits persist per-user via `localStorage` using unique keys — they **never reset on page refresh** and are completely isolated between users:

```
Guest user   →  localStorage key: tx_credits_guest
Logged in    →  localStorage key: tx_credits_user_[userId]
```

<br/>

## 🎨 AI Image Generator

Powered by **[Pollinations.ai](https://pollinations.ai)** using the **Flux** model:

| | |
|:---|:---|
| 💰 **Cost** | Completely free |
| 🔑 **API Key** | Not required |
| 📊 **Quota** | Unlimited |
| 🖼️ **Resolution** | 1024 × 1024 |
| ⚡ **Speed** | ~5–15 seconds per image |
| 🧠 **Model** | Flux (state of the art, 2026) |

Images are proxied through Vite in development to avoid CORS issues:

```js
// vite.config.js
proxy: {
  '/api/image': {
    target: 'https://image.pollinations.ai',
    changeOrigin: true,
  }
}
```

<br/>

## 🌐 Deployment

### ▲ Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Vercel → Settings → Environment Variables**.

### Netlify

```bash
npm run build
# Drag the dist/ folder to Netlify UI
```

Add a `netlify.toml` for SPA routing:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

<br/>

## 🤝 Contributing

All contributions are welcome!

```bash
# Fork → Clone → Branch
git checkout -b feature/your-feature

# Make changes, then
git commit -m "feat: describe your change"
git push origin feature/your-feature

# Open a Pull Request ✓
```

<br/>

## 👥 Built By

<div align="center">

|  |  |
|:---:|:---:|
| **Syeda Nimra** | **Muhammad Ahsan** |
| *Frontend Developer & Co-Founder* | *Full-Stack Developer & Co-Founder* |
| React · Tailwind · Responsive Design | React · Node.js · Supabase · GSAP |

</div>

<br/>

## 📄 License

Distributed under the **MIT License** — use it, modify it, ship it.

<br/>

<div align="center">

---

**If Transformix helped you, drop a ⭐ — it means a lot!**

[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/transformix?style=social)](../../stargazers)

```
Built from scratch · Dec 2025 → Mar 2026 · Made with ❤️ in Pakistan
```

</div>