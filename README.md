# 🎭 StoryWeaver

**StoryWeaver** is an interactive, AI-powered storytelling platform that turns simple prompts into immersive, narrated adventures with high-quality visual illustrations. Built for the modern web using Next.js and powered by decentralized AI generation.

## ✨ Features

- **Interactive Narratives:** Generate unique, branching storylines based on any prompt.
- **AI Visuals:** Real-time image generation via **Pollinations.ai** to bring your scenes to life.
- **Narrator Voice:** Immersive text-to-speech for an audiobook-style experience using **Murf AI**.
- **Persistence:** Save your favorite stories and progress using **Supabase**.
- **Modern UI:** A sleek, responsive interface built with **Tailwind CSS** and **Shadcn UI**.

## 🛠️ Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Database & Auth:** Supabase
- **Image Generation:** Pollinations.ai (API-free)
- **Voice Narration:** Murf AI / Web Speech API
- **Deployment:** Vercel

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/amaltomajith/StoryWeaver.git](https://github.com/amaltomajith/StoryWeaver.git)
cd StoryWeaver
```
2. Install Dependencies
```bash
npm install
```
3. Setup Environment Variables
Create a file named .env.local in the root directory and paste the following:
```Code snippet
# --- Supabase (Core Backend) ---
NEXT_PUBLIC_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# --- Pollinations.ai (Image Generation) ---
NEXT_PUBLIC_POLLINATIONS_API_KEY=your-optional-key

# --- Murf AI (Voice Narration) ---
NEXT_PUBLIC_MURF_API_KEY=your-murf-api-key
MURF_API_KEY=your-murf-api-key
```
4. Run the development server
```bash
npm run dev
```
Open http://localhost:3000 in your browser.
